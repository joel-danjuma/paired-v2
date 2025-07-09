from sqlalchemy import Column, String, Integer, DateTime, Enum, JSON, Boolean, ForeignKey, DECIMAL
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base
import uuid
import enum

class MatchStatus(str, enum.Enum):
    PENDING = "pending"
    MUTUAL = "mutual"
    DECLINED = "declined"
    EXPIRED = "expired"

class Match(Base):
    __tablename__ = "matches"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    target_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id"), nullable=True)
    
    # Match scoring
    compatibility_score = Column(DECIMAL(5, 4), nullable=False)
    match_reasons = Column(JSON, nullable=True)  # Detailed reasons for the match
    
    # Match status and interactions
    status = Column(Enum(MatchStatus), nullable=False, default=MatchStatus.PENDING)
    user_action = Column(String(20), nullable=True)  # liked, passed, etc.
    target_action = Column(String(20), nullable=True)
    
    # Algorithm metadata
    algorithm_version = Column(String(20), nullable=True)
    match_factors = Column(JSON, nullable=True)  # Factors that contributed to the match
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    target = relationship("User", foreign_keys=[target_id])
    listing = relationship("Listing")
    
    def __repr__(self):
        return f"<Match(id={self.id}, score={self.compatibility_score}, status={self.status})>" 