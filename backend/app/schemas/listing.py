from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from uuid import UUID
from datetime import datetime
from app.models.listing import ListingType, ListingStatus

class ListingBase(BaseModel):
    listing_type: ListingType
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    address: Optional[str] = Field(None, max_length=500)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=50)
    zip_code: Optional[str] = Field(None, max_length=20)
    
    price_min: Optional[float] = Field(None, gt=0)
    price_max: Optional[float] = Field(None, gt=0)
    
    property_details: Optional[Dict] = None
    lifestyle_preferences: Optional[Dict] = None
    images: Optional[List[str]] = None
    
    available_from: Optional[datetime] = None
    available_until: Optional[datetime] = None

class ListingCreate(ListingBase):
    pass

class ListingUpdate(ListingBase):
    title: Optional[str] = Field(None, max_length=200)
    listing_type: Optional[ListingType] = None
    status: Optional[ListingStatus] = None

class Listing(ListingBase):
    id: UUID
    user_id: UUID
    status: ListingStatus
    created_at: datetime
    updated_at: Optional[datetime]
    view_count: int
    contact_count: int

    class Config:
        orm_mode = True

class ListingWithUser(Listing):
    user: "UserPublicProfile"

from app.schemas.user import UserPublicProfile
ListingWithUser.update_forward_refs() 