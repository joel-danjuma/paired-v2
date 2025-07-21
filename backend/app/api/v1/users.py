from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from sqlalchemy.orm import selectinload
from uuid import UUID
from typing import List

from app.models.database import get_db_session
from app.models.user import User
from app.models.listing import Listing
from app.schemas.user import UserProfile, UserUpdate, UserPublicProfile, OnboardingData
from app.schemas.listing import Listing as ListingSchema
from app.schemas.verification import (
    IdentityDocumentUpload, 
    VerificationResult, 
    EmailVerificationRequest,
    EmailVerificationConfirm,
    VerificationStatus
)
from app.core.deps import get_current_user
from app.services import verification_service

router = APIRouter()

@router.get("/search", response_model=List[UserPublicProfile])
async def search_users(
    query: str = Query(..., min_length=2, description="Search query for user name or email"),
    limit: int = Query(20, le=50, description="Maximum number of results"),
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Search for users by name or email"""
    
    # Build search query
    search_query = (
        select(User)
        .where(
            User.is_active == True,
            User.id != current_user.id,  # Exclude current user from results
            or_(
                func.lower(User.first_name).contains(func.lower(query)),
                func.lower(User.last_name).contains(func.lower(query)),
                func.lower(User.email).contains(func.lower(query)),
                func.lower(func.concat(User.first_name, ' ', User.last_name)).contains(func.lower(query))
            )
        )
        .limit(limit)
        .order_by(User.profile_completion_score.desc())  # Order by profile completeness
    )
    
    result = await db.execute(search_query)
    users = result.scalars().all()
    
    # Convert to public profile format
    return [UserPublicProfile.from_user(user) for user in users]

@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """Get current user's full profile"""
    try:
        print(f"Fetching profile for user: {current_user.id}")
        print(f"User email: {current_user.email}")
        print(f"User active: {current_user.is_active}")
        return current_user
    except Exception as e:
        import traceback
        error_traceback = traceback.format_exc()
        print(f"Error fetching user profile: {e}")
        print(f"Full traceback: {error_traceback}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user profile: {str(e)}"
        )

@router.put("/me", response_model=UserProfile)
async def update_current_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Update current user's profile"""
    update_data = user_update.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(current_user, key, value)
        
    # Recalculate profile completion score
    # (Placeholder logic - will be more sophisticated)
    score = 0
    if current_user.first_name: score += 10
    if current_user.last_name: score += 10
    if current_user.date_of_birth: score += 10
    if current_user.bio: score += 20
    if current_user.profile_image_url: score += 20
    if current_user.preferences: score += 15
    if current_user.lifestyle_data: score += 15
    current_user.profile_completion_score = score
    
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    
    return current_user

@router.put("/me/profile", response_model=UserProfile)
async def update_onboarding_data(
    onboarding_data: OnboardingData,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Update user profile with onboarding data."""
    try:
        update_data = onboarding_data.dict(exclude_unset=True)
        print(f"Received profile update data: {update_data}")
        
        # Separate lifestyle and preferences from the rest of the data
        lifestyle_data = current_user.lifestyle_data or {}
        preferences_data = current_user.preferences or {}
        
        for key, value in update_data.items():
            print(f"Processing field: {key} = {value}")
            if key in ['is_smoker', 'has_pets', 'drinking_habits', 'sleep_schedule', 'cleanliness', 'guest_preference', 'noise_level']:
                lifestyle_data[key] = value
            elif key in ['interests', 'hobbies', 'music_preference', 'food_preference']:
                preferences_data[key] = value
            elif key == 'age':
                # Store age in lifestyle_data and optionally calculate date_of_birth
                if value and isinstance(value, int) and 18 <= value <= 100:
                    lifestyle_data['age'] = value
                    # Optionally set approximate date_of_birth if not already set
                    if not current_user.date_of_birth:
                        from datetime import datetime, timedelta
                        approximate_birth_year = datetime.now().year - value
                        current_user.date_of_birth = datetime(approximate_birth_year, 1, 1)
            else:
                # Set direct user attributes
                if hasattr(current_user, key):
                    setattr(current_user, key, value)
                else:
                    print(f"Warning: Unknown field {key}")
                
        current_user.lifestyle_data = lifestyle_data
        current_user.preferences = preferences_data
        
        print(f"Updated lifestyle_data: {lifestyle_data}")
        print(f"Updated preferences: {preferences_data}")
        
        # Recalculate profile completion score with proper error handling
        score = 0
        try:
            if current_user.first_name: score += 5
            if current_user.last_name: score += 5
            if current_user.date_of_birth or lifestyle_data.get('age'): score += 10
            if current_user.bio: score += 15
            if current_user.profile_image_url: score += 15
            if current_user.preferences and len(current_user.preferences) > 2: score += 20
            if current_user.lifestyle_data and len(current_user.lifestyle_data) > 3: score += 20
            if current_user.is_verified_email: score += 5
            if current_user.is_verified_phone: score += 5
            current_user.profile_completion_score = min(score, 100)
            print(f"Calculated profile completion score: {score}")
        except Exception as e:
            # If profile completion calculation fails, set a default score
            print(f"Error calculating profile completion score: {e}")
            current_user.profile_completion_score = 50

        db.add(current_user)
        await db.commit()
        await db.refresh(current_user)
        
        print(f"Successfully updated profile for user {current_user.id}")
        return current_user
        
    except Exception as e:
        await db.rollback()
        import traceback
        error_traceback = traceback.format_exc()
        print(f"Error updating onboarding data: {e}")
        print(f"Full traceback: {error_traceback}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )

@router.get("/{user_id}", response_model=UserPublicProfile)
async def get_user_public_profile(
    user_id: UUID,
    db: AsyncSession = Depends(get_db_session)
):
    """Get a user's public profile"""
    result = await db.execute(select(User).where(User.id == user_id, User.is_active == True))
    user = result.scalar_one_or_none()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserPublicProfile.from_user(user)

# Verification endpoints

@router.get("/me/verification", response_model=VerificationStatus)
async def get_verification_status(
    current_user: User = Depends(get_current_user)
):
    """Get current user's verification status"""
    return VerificationStatus(
        is_verified_email=current_user.is_verified_email,
        is_verified_phone=current_user.is_verified_phone,
        is_verified_identity=current_user.is_verified_identity,
        is_background_checked=current_user.is_background_checked,
        verification_details=current_user.verification_status
    )

@router.post("/me/verification/email/send")
async def send_email_verification(
    current_user: User = Depends(get_current_user)
):
    """Send email verification"""
    if current_user.is_verified_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )
    
    await verification_service.send_email_verification(current_user)
    return {"message": "Verification email sent"}

@router.post("/me/verification/email/confirm")
async def confirm_email_verification(
    verification_data: EmailVerificationConfirm,
    db: AsyncSession = Depends(get_db_session)
):
    """Confirm email verification"""
    user_id = verification_service.verify_token(verification_data.token)
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    
    # Update user verification status
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_verified_email = True
    await db.commit()
    
    return {"message": "Email verified successfully"}

@router.post("/me/verification/identity", response_model=VerificationResult)
async def upload_identity_document(
    document_data: IdentityDocumentUpload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Upload and verify identity document"""
    # Verify the document
    verification_result = verification_service.verify_identity_document(
        document_data.dict()
    )
    
    # Update user verification status
    if verification_result["is_valid"]:
        current_user.is_verified_identity = True
        current_user.verification_status = verification_result
        await db.commit()
    
    return VerificationResult(**verification_result)

@router.get("/me/listings", response_model=List[ListingSchema])
async def get_current_user_listings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Get all listings for the current user"""
    try:
        result = await db.execute(
            select(Listing)
            .where(Listing.user_id == current_user.id)
            .where(Listing.status != "expired")  # Don't show deleted listings
        )
        listings = result.scalars().all()
        print(f"Found {len(listings)} listings for user {current_user.id}")
        return listings
    except Exception as e:
        print(f"Error fetching user listings: {e}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        # Return empty list instead of 500 error
        return []

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_current_user_account(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Delete current user's account (soft delete)"""
    # Mark user as inactive instead of hard delete
    current_user.is_active = False
    
    # Also soft delete all user's listings
    result = await db.execute(
        select(Listing).where(Listing.user_id == current_user.id)
    )
    listings = result.scalars().all()
    for listing in listings:
        listing.status = "expired"
    
    await db.commit()
    return None 