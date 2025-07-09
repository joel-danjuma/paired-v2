from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.models.database import get_db_session
from app.models.user import User
from app.schemas.user import UserProfile, UserUpdate, UserPublicProfile
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

@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """Get current user's full profile"""
    return current_user

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