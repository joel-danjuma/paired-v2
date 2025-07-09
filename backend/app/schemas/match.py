from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from app.schemas.user import UserPublicProfile

class MatchAction(BaseModel):
    action: str  # e.g., "accept", "decline", "favorite"

class MatchRecommendation(BaseModel):
    user: UserPublicProfile
    compatibility_score: float
    
    class Config:
        orm_mode = True

class MutualMatch(BaseModel):
    user: UserPublicProfile
    listing_id: Optional[UUID] = None

    class Config:
        orm_mode = True 