from sqlalchemy import Column, String, Integer, DateTime, JSON, Boolean, ForeignKey, Text, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base
import uuid

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    thread_id = Column(String(255), unique=True, nullable=False, index=True)
    
    # Participants
    participants = Column(ARRAY(UUID(as_uuid=True)), nullable=False)
    
    # Related entities
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id"), nullable=True)
    match_id = Column(UUID(as_uuid=True), ForeignKey("matches.id"), nullable=True)
    
    # Conversation state (for LangGraph workflows)
    conversation_state = Column(JSON, nullable=True)
    
    # Encryption and security
    encryption_key = Column(String(255), nullable=True)
    
    # Conversation metadata
    is_active = Column(Boolean, default=True)
    last_message_at = Column(DateTime(timezone=True), nullable=True)
    message_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    listing = relationship("Listing")
    match = relationship("Match")
    
    def __repr__(self):
        return f"<Conversation(id={self.id}, thread_id={self.thread_id})>"

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=False)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Message content
    content = Column(Text, nullable=False)
    message_type = Column(String(50), default="text")  # text, image, file, etc.
    
    # Message metadata
    is_read = Column(Boolean, default=False)
    is_encrypted = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    read_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    conversation = relationship("Conversation")
    sender = relationship("User")
    
    def __repr__(self):
        return f"<Message(id={self.id}, sender_id={self.sender_id})>" 