from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class MessageCreate(BaseModel):
    content: str = Field(..., max_length=5000)
    message_type: str = Field(default="text")

class Message(BaseModel):
    id: UUID
    conversation_id: UUID
    sender_id: UUID
    content: str
    message_type: str
    is_read: bool
    created_at: datetime
    
    class Config:
        orm_mode = True

class ConversationCreate(BaseModel):
    participants: List[UUID] = Field(..., min_items=2, max_items=2)
    listing_id: Optional[UUID] = None

class Conversation(BaseModel):
    id: UUID
    thread_id: str
    participants: List[UUID]
    listing_id: Optional[UUID]
    is_active: bool
    last_message_at: Optional[datetime]
    message_count: int
    created_at: datetime
    
    class Config:
        orm_mode = True

class ConversationWithMessages(Conversation):
    messages: List[Message] = [] 