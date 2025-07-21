from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone
# Remove geoalchemy2 import to work without PostGIS
# from geoalchemy2.functions import ST_DWithin
import traceback

from app.models.database import get_db_session
from app.models.user import User
from app.models.listing import Listing, ListingType, ListingStatus
from app.schemas.listing import ListingCreate, ListingUpdate, Listing as ListingSchema, ListingWithUser
from app.core.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[ListingWithUser])
async def get_listings(
    db: AsyncSession = Depends(get_db_session),
    skip: int = 0,
    limit: int = 20,
    listing_type: Optional[ListingType] = Query(None)
):
    """Get all active listings"""
    query = (
        select(Listing)
        .where(Listing.status == ListingStatus.ACTIVE)
        .options(selectinload(Listing.user))
        .offset(skip)
        .limit(limit)
    )
    
    if listing_type:
        query = query.where(Listing.listing_type == listing_type)
        
    result = await db.execute(query)
    listings = result.scalars().all()
    
    return listings

@router.post("/", response_model=ListingSchema, status_code=status.HTTP_201_CREATED)
async def create_listing(
    listing_data: ListingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Create a new listing"""
    try:
        # Convert listing data to dict
        listing_dict = listing_data.dict()
        print(f"Received listing data: {listing_dict}")
        
        # Validate required fields
        if not listing_dict.get('title'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Title is required"
            )
        
        if not listing_dict.get('listing_type'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Listing type is required"
            )
        
        # Remove any None values and problematic fields
        clean_dict = {k: v for k, v in listing_dict.items() if v is not None}
        
        # Temporarily exclude location field to avoid geometry/varchar conflicts
        if 'location' in clean_dict:
            print(f"Temporarily excluding location field: {clean_dict['location']}")
            del clean_dict['location']
        
        print(f"Clean listing data: {clean_dict}")
        
        new_listing = Listing(
            **clean_dict,
            user_id=current_user.id
        )
        
        print(f"Created listing object: {new_listing}")
        
        db.add(new_listing)
        print("Added listing to session")
        
        await db.commit()
        print("Committed to database")
        
        await db.refresh(new_listing)
        print(f"Refreshed listing: {new_listing}")
        
        return new_listing
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        await db.rollback()
        error_traceback = traceback.format_exc()
        print(f"Error creating listing: {e}")
        print(f"Full traceback: {error_traceback}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create listing: {str(e)}"
        )

@router.get("/search", response_model=List[ListingWithUser])
async def search_listings(
    db: AsyncSession = Depends(get_db_session),
    lat: Optional[float] = Query(None, description="Latitude for location-based search"),
    lon: Optional[float] = Query(None, description="Longitude for location-based search"),
    radius: Optional[int] = Query(10000, description="Search radius in meters"),
    listing_type: Optional[ListingType] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    skip: int = 0,
    limit: int = 20
):
    """Search for listings with basic filtering (without PostGIS for compatibility)"""
    query = (
        select(Listing)
        .where(Listing.status == ListingStatus.ACTIVE)
        .options(selectinload(Listing.user))
        .offset(skip)
        .limit(limit)
    )
    
    # Note: Location-based search disabled without PostGIS
    # if lat is not None and lon is not None:
    #     point = f"POINT({lon} {lat})"
    #     query = query.where(ST_DWithin(Listing.location, point, radius))
        
    if listing_type:
        query = query.where(Listing.listing_type == listing_type)
        
    if min_price:
        query = query.where(Listing.price_min >= min_price)
        
    if max_price:
        query = query.where(Listing.price_max <= max_price)
        
    result = await db.execute(query)
    listings = result.scalars().all()
    
    return listings

@router.get("/locations", response_model=List[str])
async def get_listing_locations(db: AsyncSession = Depends(get_db_session)):
    """Get a list of unique listing locations"""
    query = select(func.distinct(Listing.city)).where(Listing.city.isnot(None))
    result = await db.execute(query)
    locations = result.scalars().all()
    return locations

@router.get("/{listing_id}", response_model=ListingWithUser)
async def get_listing(
    listing_id: UUID,
    db: AsyncSession = Depends(get_db_session)
):
    """Get a specific listing by ID"""
    result = await db.execute(
        select(Listing)
        .where(Listing.id == listing_id)
        .options(selectinload(Listing.user))
    )
    listing = result.scalar_one_or_none()
    
    if listing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    # Increment view count
    listing.view_count += 1
    await db.commit()
    
    return listing

@router.put("/{listing_id}", response_model=ListingSchema)
async def update_listing(
    listing_id: UUID,
    listing_data: ListingUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Update a listing"""
    result = await db.execute(
        select(Listing).where(Listing.id == listing_id)
    )
    listing = result.scalar_one_or_none()
    
    if listing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
        
    if listing.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this listing"
        )
        
    update_data = listing_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(listing, key, value)
        
    await db.commit()
    await db.refresh(listing)
    return listing

@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_listing(
    listing_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Delete a listing (soft delete)"""
    result = await db.execute(
        select(Listing).where(Listing.id == listing_id)
    )
    listing = result.scalar_one_or_none()
    
    if listing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
        
    if listing.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this listing"
        )
    
    listing.status = "expired"  # Soft delete
    await db.commit()
    
    return None 