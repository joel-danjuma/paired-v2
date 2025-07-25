from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, List, TYPE_CHECKING
from uuid import UUID
from datetime import datetime
from app.models.user import UserType

if TYPE_CHECKING:
    from app.schemas.listing import Listing

class UserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    user_type: UserType
    profile_image_url: Optional[str] = Field(None, max_length=500)

class UserProfile(UserBase):
    id: UUID
    is_active: bool
    is_verified_email: bool
    is_verified_phone: bool
    is_verified_identity: bool
    is_background_checked: bool
    profile_completion_score: int
    created_at: datetime
    last_active: Optional[datetime]
    
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    date_of_birth: Optional[datetime] = None
    bio: Optional[str] = None
    preferences: Optional[Dict] = None
    lifestyle_data: Optional[Dict] = None
    phone: Optional[str] = Field(None, max_length=20)

class OnboardingData(BaseModel):
    bio: Optional[str] = None
    occupation: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    is_smoker: Optional[bool] = None
    has_pets: Optional[bool] = None
    drinking_habits: Optional[str] = None
    sleep_schedule: Optional[str] = None
    cleanliness: Optional[str] = None
    guest_preference: Optional[str] = None
    noise_level: Optional[str] = None
    interests: Optional[str] = None
    hobbies: Optional[str] = None
    music_preference: Optional[str] = None
    food_preference: Optional[str] = None

class UserPublicProfile(BaseModel):
    id: UUID
    first_name: Optional[str]
    last_name_initial: Optional[str]
    user_type: UserType
    profile_image_url: Optional[str]
    bio: Optional[str]
    is_verified_identity: bool
    is_background_checked: bool
    profile_completion_score: int
    
    class Config:
        from_attributes = True

    @classmethod
    def from_user(cls, user: "User"):
        return cls(
            id=user.id,
            first_name=user.first_name,
            last_name_initial=user.last_name[0] if user.last_name else None,
            user_type=user.user_type,
            profile_image_url=user.profile_image_url,
            bio=user.bio,
            is_verified_identity=user.is_verified_identity,
            is_background_checked=user.is_background_checked,
            profile_completion_score=user.profile_completion_score
        ) 

class User(UserBase):
    id: int
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserWithListings(User):
    listings: List["Listing"] = []

    class Config:
        from_attributes = True 