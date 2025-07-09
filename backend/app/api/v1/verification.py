from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any

from app.models.database import get_db_session
from app.models.user import User
from app.core.deps import get_current_user
from app.schemas.verification import (
    EmailVerificationRequest, 
    PhoneVerificationRequest,
    VerificationCodeRequest,
    IdentityVerificationRequest,
    BackgroundCheckRequest,
    DocumentVerificationRequest
)
from app.services.verification import verification_service

router = APIRouter()

# Email and Phone Verification (existing)

@router.post("/email/send")
async def send_email_verification(
    request: EmailVerificationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Send email verification code."""
    success = await verification_service.send_email_verification(
        str(current_user.id), 
        request.email
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification email"
        )
    
    return {"message": "Verification code sent to email"}

@router.post("/email/verify")
async def verify_email_code(
    request: VerificationCodeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Verify email verification code."""
    success = await verification_service.verify_email_code(
        str(current_user.id), 
        request.code
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code"
        )
    
    # Update user's email verification status
    current_user.is_verified_email = True
    db.add(current_user)
    await db.commit()
    
    return {"message": "Email verified successfully"}

@router.post("/phone/send")
async def send_phone_verification(
    request: PhoneVerificationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Send phone verification code."""
    success = await verification_service.send_phone_verification(
        str(current_user.id), 
        request.phone
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification SMS"
        )
    
    return {"message": "Verification code sent to phone"}

@router.post("/phone/verify")
async def verify_phone_code(
    request: VerificationCodeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Verify phone verification code."""
    success = await verification_service.verify_phone_code(
        str(current_user.id), 
        request.code
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code"
        )
    
    # Update user's phone verification status
    current_user.is_verified_phone = True
    db.add(current_user)
    await db.commit()
    
    return {"message": "Phone verified successfully"}

# Third-Party Verification Endpoints

@router.post("/identity/initiate")
async def initiate_identity_verification(
    request: IdentityVerificationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Initiate identity verification with third-party provider."""
    
    # Prepare user data for verification
    user_data = {
        "user_id": str(current_user.id),
        "first_name": request.first_name,
        "last_name": request.last_name,
        "date_of_birth": request.date_of_birth.isoformat() if request.date_of_birth else None,
        "email": current_user.email,
        "phone": current_user.phone,
        "address": {
            "street": request.address.get("street", ""),
            "city": request.address.get("city", ""),
            "state": request.address.get("state", ""),
            "postal_code": request.address.get("postal_code", ""),
            "country": request.address.get("country", "US")
        } if request.address else {}
    }
    
    result = await verification_service.initiate_identity_verification(
        str(current_user.id), 
        user_data
    )
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to initiate identity verification")
        )
    
    return {
        "verification_id": result["verification_id"],
        "redirect_url": result.get("redirect_url"),
        "status": result.get("status"),
        "message": "Identity verification initiated successfully"
    }

@router.post("/background-check/initiate")
async def initiate_background_check(
    request: BackgroundCheckRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Initiate background check with third-party provider."""
    
    # Prepare user data for background check
    user_data = {
        "user_id": str(current_user.id),
        "first_name": request.first_name,
        "last_name": request.last_name,
        "middle_name": request.middle_name,
        "date_of_birth": request.date_of_birth.isoformat(),
        "ssn": request.ssn,  # Handle securely in production
        "email": current_user.email,
        "phone": current_user.phone,
        "address": request.address,
        "previous_addresses": request.previous_addresses or [],
        "check_types": request.check_types or ["criminal", "sex_offender", "eviction"]
    }
    
    result = await verification_service.initiate_background_check(
        str(current_user.id), 
        user_data
    )
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to initiate background check")
        )
    
    return {
        "check_id": result["check_id"],
        "status": result.get("status"),
        "estimated_completion": result.get("estimated_completion"),
        "message": "Background check initiated successfully"
    }

@router.post("/document/verify")
async def verify_document(
    request: DocumentVerificationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Verify a document with third-party provider."""
    
    # Prepare document data
    document_data = {
        "user_id": str(current_user.id),
        "type": request.document_type,
        "image_front": request.image_front,  # Base64 encoded image
        "image_back": request.image_back,    # Base64 encoded image (optional)
        "holder_name": request.holder_name,
        "country": request.country or "US"
    }
    
    result = await verification_service.verify_document(
        str(current_user.id), 
        document_data
    )
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to verify document")
        )
    
    return {
        "verification_id": result.get("verification_id"),
        "document_valid": result["document_valid"],
        "confidence": result.get("confidence"),
        "extracted_data": result.get("extracted_data", {}),
        "message": "Document verification completed"
    }

@router.get("/status/{verification_id}")
async def check_verification_status(
    verification_id: str,
    current_user: User = Depends(get_current_user)
):
    """Check the status of a verification."""
    
    result = await verification_service.check_verification_status(verification_id)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.get("error", "Verification not found")
        )
    
    return {
        "verification_id": verification_id,
        "status": result["status"],
        "updated_at": result.get("updated_at"),
        "message": f"Verification status: {result['status']}"
    }

@router.get("/result/{verification_id}")
async def get_verification_result(
    verification_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Get the result of a completed verification."""
    
    result = await verification_service.get_verification_result(verification_id)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Verification result not available")
        )
    
    # Update user verification status based on result
    if result.get("result", {}).get("identity_verified"):
        current_user.is_verified_identity = True
    
    if result.get("result", {}).get("clear"):
        current_user.is_background_checked = True
    
    db.add(current_user)
    await db.commit()
    
    return {
        "verification_id": verification_id,
        "status": result["status"],
        "result": result["result"],
        "completed_at": result.get("completed_at"),
        "message": "Verification completed successfully"
    }

@router.post("/webhook/{provider}")
async def verification_webhook(
    provider: str,
    request: Request,
    db: AsyncSession = Depends(get_db_session)
):
    """Handle verification webhooks from third-party providers."""
    
    # Get webhook data
    webhook_data = await request.json()
    
    # Process webhook
    success = await verification_service.process_verification_webhook(provider, webhook_data)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to process webhook"
        )
    
    return {"message": "Webhook processed successfully"}

@router.get("/stats")
async def get_verification_stats(
    current_user: User = Depends(get_current_user)
):
    """Get verification service statistics."""
    return verification_service.get_verification_stats() 