from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
from uuid import UUID
from geoalchemy2.functions import ST_DWithin

from app.models.database import get_db_session
from app.models.user import User
from app.models.listing import Listing, ListingType, ListingStatus
from app.schemas.listing import ListingCreate, ListingUpdate, Listing as ListingSchema, ListingWithUser
from app.core.deps import get_current_user

router = APIRouter()

@router.get("/random", response_model=List[ListingSchema])
async def get_random_listings(
    limit: int = 10,
    db: AsyncSession = Depends(get_db_session)
):
    """Get a list of random listings."""
    result = await db.execute(
        select(Listing)
        .where(Listing.status == ListingStatus.ACTIVE)
        .order_by(func.random())
        .limit(limit)
    )
    listings = result.scalars().all()
    return listings

@router.post("/", response_model=ListingSchema, status_code=status.HTTP_201_CREATED)
async def create_listing(
    listing_data: ListingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Create a new listing"""
    new_listing = Listing(
        **listing_data.dict(),
        user_id=current_user.id
    )
    
    # Placeholder for geocoding address to lat/lon
    # new_listing.location = 'POINT(lon lat)'
    
    db.add(new_listing)
    await db.commit()
    await db.refresh(new_listing)
    return new_listing

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
    """Search for listings with location-based filtering"""
    query = (
        select(Listing)
        .where(Listing.status == ListingStatus.ACTIVE)
        .options(selectinload(Listing.user))
        .offset(skip)
        .limit(limit)
    )
    
    if lat is not None and lon is not None:
        point = f"POINT({lon} {lat})"
        query = query.where(ST_DWithin(Listing.location, point, radius))
        
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