from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
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
    Message as MessageSchema
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

@router.get("/", response_model=List[ConversationSchema])
async def get_user_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Get all conversations for the current user"""
    result = await db.execute(
        select(Conversation)
        .where(Conversation.participants.contains([current_user.id]))
        .where(Conversation.is_active == True)
    )
    conversations = result.scalars().all()
    return conversations

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