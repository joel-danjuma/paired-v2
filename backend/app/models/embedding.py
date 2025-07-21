from sqlalchemy import Column, String, Integer, DateTime, Enum, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
# Temporarily remove pgvector import to work on managed databases
# from pgvector.sqlalchemy import Vector
from .database import Base
import uuid
import enum

class EmbeddingType(str, enum.Enum):
    USER = "user"
    LISTING = "listing"

class UserEmbedding(Base):
    __tablename__ = "user_embeddings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Vector embedding (stored as JSON array instead of Vector for compatibility)
    embedding = Column(JSON, nullable=False)  # Store as JSON array instead of pgvector
    embedding_type = Column(Enum(EmbeddingType), nullable=False, default=EmbeddingType.USER)
    
    # Metadata
    model_version = Column(String(50), nullable=True)
    source_data_hash = Column(String(64), nullable=True)  # To track when to update
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="embeddings")

    def __repr__(self):
        return f"<UserEmbedding(id={self.id}, user_id={self.user_id})>"

class ListingEmbedding(Base):
    __tablename__ = "listing_embeddings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id"), nullable=False)
    
    # Vector embedding (stored as JSON array instead of Vector for compatibility)
    embedding = Column(JSON, nullable=False)  # Store as JSON array instead of pgvector
    embedding_type = Column(Enum(EmbeddingType), nullable=False, default=EmbeddingType.LISTING)
    
    # Metadata
    model_version = Column(String(50), nullable=True)
    source_data_hash = Column(String(64), nullable=True)  # To track when to update
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    # listing = relationship("Listing", back_populates="embeddings")

    def __repr__(self):
        return f"<ListingEmbedding(id={self.id}, listing_id={self.listing_id})>" 