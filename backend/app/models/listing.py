from sqlalchemy import Column, String, Integer, DateTime, Enum, JSON, Boolean, Text, ForeignKey, DECIMAL
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from geoalchemy2 import Geography
from .database import Base
import uuid
import enum

class ListingType(str, enum.Enum):
    ROOM = "room"
    ROOMMATE_WANTED = "roommate_wanted"

class ListingStatus(str, enum.Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    FILLED = "filled"
    EXPIRED = "expired"

class Listing(Base):
    __tablename__ = "listings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Listing classification
    listing_type = Column(Enum(ListingType), nullable=False)
    status = Column(Enum(ListingStatus), nullable=False, default=ListingStatus.ACTIVE)
    
    # Basic information
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    
    # Location (PostGIS Geography column)
    location = Column(Geography(geometry_type="POINT", srid=4326), nullable=True)
    address = Column(String(500), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(50), nullable=True)
    zip_code = Column(String(20), nullable=True)
    country = Column(String(50), nullable=True, default="US")
    
    # Pricing
    price_min = Column(DECIMAL(10, 2), nullable=True)
    price_max = Column(DECIMAL(10, 2), nullable=True)
    price_range = Column(JSON, nullable=True)  # Additional pricing details
    
    # Property details (for room listings)
    property_details = Column(JSON, nullable=True)  # bedrooms, bathrooms, amenities, etc.
    
    # Lifestyle preferences and requirements
    lifestyle_preferences = Column(JSON, nullable=True)
    
    # Media and images
    images = Column(JSON, nullable=True)  # Array of image URLs
    
    # Availability
    available_from = Column(DateTime, nullable=True)
    available_until = Column(DateTime, nullable=True)
    
    # Metrics
    view_count = Column(Integer, default=0)
    contact_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="listings")
    
    def __repr__(self):
        return f"<Listing(id={self.id}, title={self.title}, type={self.listing_type})>" 