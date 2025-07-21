from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List
from uuid import UUID, uuid4
import json

from app.models.database import get_db_session
from app.models.user import User
from app.models.conversation import Conversation, Message
from app.schemas.conversation import (
    ConversationCreate, 
    Conversation as ConversationSchema,
    ConversationWithMessages,
    MessageCreate,
    Message as MessageSchema,
    ContactInfo
)
from app.core.deps import get_current_user

router = APIRouter()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: str, user_id: str):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(message)

manager = ConnectionManager()

@router.post("/", response_model=ConversationSchema, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    conversation_data: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Create a new conversation"""
    if current_user.id not in conversation_data.participants:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current user must be a participant"
        )
    
    new_conversation = Conversation(
        thread_id=str(uuid4()),
        participants=conversation_data.participants,
        listing_id=conversation_data.listing_id
    )
    
    db.add(new_conversation)
    await db.commit()
    await db.refresh(new_conversation)
    return new_conversation

@router.post("/start/{user_id}", response_model=ConversationSchema, status_code=status.HTTP_201_CREATED)
async def start_conversation_with_user(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Start a conversation with a specific user"""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot start conversation with yourself"
        )
    
    # Check if user exists
    result = await db.execute(select(User).where(User.id == user_id))
    target_user = result.scalar_one_or_none()
    
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if conversation already exists
    result = await db.execute(
        select(Conversation)
        .where(Conversation.participants.contains([current_user.id, user_id]))
        .where(Conversation.is_active == True)
    )
    existing_conversation = result.scalar_one_or_none()
    
    if existing_conversation:
        return existing_conversation
    
    # Create new conversation
    new_conversation = Conversation(
        thread_id=str(uuid4()),
        participants=[current_user.id, user_id]
    )
    
    db.add(new_conversation)
    await db.commit()
    await db.refresh(new_conversation)
    return new_conversation

@router.get("/", response_model=List[ContactInfo])
async def get_user_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Get all conversations for the current user formatted as contacts"""
    try:
        result = await db.execute(
            select(Conversation)
            .where(Conversation.participants.contains([current_user.id]))
            .where(Conversation.is_active == True)
            .order_by(Conversation.last_message_at.desc().nullslast())
        )
        conversations = result.scalars().all()
        
        # For now, return empty list if no conversations
        if not conversations:
            return []
        
        contacts = []
        for conversation in conversations:
            # Get the other participant (not the current user)
            other_participant_ids = [pid for pid in conversation.participants if pid != current_user.id]
            if not other_participant_ids:
                continue
                
            other_participant_id = other_participant_ids[0]
            
            # Get other participant's info
            user_result = await db.execute(
                select(User).where(User.id == other_participant_id)
            )
            other_user = user_result.scalar_one_or_none()
            
            if not other_user:
                continue
                
            # Get last message
            last_message_result = await db.execute(
                select(Message)
                .where(Message.conversation_id == conversation.id)
                .order_by(Message.created_at.desc())
                .limit(1)
            )
            last_message = last_message_result.scalar_one_or_none()
            
            # Count unread messages (messages not from current user that are unread)
            unread_result = await db.execute(
                select(Message)
                .where(Message.conversation_id == conversation.id)
                .where(Message.sender_id != current_user.id)
                .where(Message.is_read == False)
            )
            unread_count = len(unread_result.scalars().all())
            
            # Create contact info
            contact = ContactInfo(
                id=str(conversation.id),
                name=f"{other_user.first_name or ''} {other_user.last_name or ''}".strip() or "Unknown User",
                avatar=other_user.profile_image_url,
                lastMessage=last_message.content if last_message else None,
                lastMessageTime=last_message.created_at if last_message else None,
                unread=unread_count
            )
            contacts.append(contact)
        
        return contacts
        
    except Exception as e:
        print(f"Error fetching conversations: {e}")
        # Return empty list instead of error to prevent frontend crashes
        return []

@router.get("/{conversation_id}", response_model=ConversationWithMessages)
async def get_conversation_with_messages(
    conversation_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Get a conversation with its messages"""
    result = await db.execute(
        select(Conversation)
        .where(Conversation.id == conversation_id)
        .options(selectinload(Conversation.messages))
    )
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    if current_user.id not in conversation.participants:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this conversation"
        )
    
    return conversation

@router.post("/{conversation_id}/messages", response_model=MessageSchema)
async def send_message(
    conversation_id: UUID,
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Send a message in a conversation"""
    # Verify conversation exists and user has access
    result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    if current_user.id not in conversation.participants:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to send messages in this conversation"
        )
    
    # Create message
    new_message = Message(
        conversation_id=conversation_id,
        sender_id=current_user.id,
        content=message_data.content,
        message_type=message_data.message_type
    )
    
    db.add(new_message)
    
    # Update conversation
    conversation.message_count += 1
    conversation.last_message_at = new_message.created_at
    
    await db.commit()
    await db.refresh(new_message)
    
    # Send real-time notification to other participants
    for participant_id in conversation.participants:
        if participant_id != current_user.id:
            await manager.send_personal_message(
                json.dumps({
                    "type": "new_message",
                    "message": {
                        "id": str(new_message.id),
                        "content": new_message.content,
                        "sender_id": str(current_user.id),
                        "conversation_id": str(conversation_id)
                    }
                }),
                str(participant_id)
            )
    
    return new_message

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time messaging"""
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back for now - in a real app, this would handle different message types
            await manager.send_personal_message(f"Echo: {data}", user_id)
    except WebSocketDisconnect:
        manager.disconnect(user_id) 

@router.get("/debug/tables")
async def debug_database_tables(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Debug endpoint to check database table status"""
    try:
        # Check if conversations table exists and count records
        conv_result = await db.execute(select(func.count(Conversation.id)))
        conv_count = conv_result.scalar()
        
        # Check if messages table exists and count records  
        msg_result = await db.execute(select(func.count(Message.id)))
        msg_count = msg_result.scalar()
        
        # Check if users table exists and count records
        user_result = await db.execute(select(func.count(User.id)))
        user_count = user_result.scalar()
        
        return {
            "status": "success",
            "tables": {
                "conversations": {"exists": True, "count": conv_count},
                "messages": {"exists": True, "count": msg_count},
                "users": {"exists": True, "count": user_count}
            },
            "current_user_id": str(current_user.id)
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "message": "Database tables may not exist or there's a connection issue"
        } 