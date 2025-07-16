from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from app.schemas.user import UserPublicProfile

class MatchAction(BaseModel):
    action: str  # e.g., "accept", "decline", "favorite"

class MatchRecommendation(BaseModel):
    user: UserPublicProfile
    compatibility_score: float
    
    class Config:
        from_attributes = True

class Match(BaseModel):
    id: UUID
    user_id: UUID
    target_id: UUID
    status: str
    user_action: Optional[str] = None
    target_action: Optional[str] = None
    compatibility_score: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class MutualMatch(BaseModel):
    user: UserPublicProfile
    listing_id: Optional[UUID] = None

    class Config:
        from_attributes = True 