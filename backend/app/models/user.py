from sqlalchemy import Column, String, Integer, DateTime, Enum, JSON, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base
import uuid
import enum

class UserType(str, enum.Enum):
    SEEKER = "seeker"
    PROVIDER = "provider"
    AGENT = "agent"
    ADMIN = "admin"

class VerificationStatus(str, enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"
    EXPIRED = "expired"

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), unique=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    
    # User classification
    user_type = Column(Enum(UserType), nullable=False, default=UserType.SEEKER)
    
    # Profile information
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    date_of_birth = Column(DateTime, nullable=True)
    bio = Column(Text, nullable=True)
    profile_image_url = Column(String(500), nullable=True)
    
    # Verification and trust
    verification_status = Column(JSON, nullable=True)  # Store verification details
    profile_completion_score = Column(Integer, default=0)
    
    # Preferences and lifestyle
    preferences = Column(JSON, nullable=True)  # Store user preferences
    lifestyle_data = Column(JSON, nullable=True)  # Store lifestyle assessment
    
    # Account status
    is_active = Column(Boolean, default=True)
    is_verified_email = Column(Boolean, default=False)
    is_verified_phone = Column(Boolean, default=False)
    is_verified_identity = Column(Boolean, default=False)
    is_background_checked = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_active = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    listings = relationship("Listing", back_populates="user")
    embeddings = relationship("UserEmbedding", back_populates="user")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, user_type={self.user_type})>" 