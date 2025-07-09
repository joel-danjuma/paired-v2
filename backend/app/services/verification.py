import asyncio
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import secrets
import hashlib

from app.core.config import settings
from app.services.notification import notification_service
from app.services.third_party_verification import (
    third_party_verification_service, 
    VerificationType, 
    VerificationStatus
)

class VerificationService:
    """Enhanced verification service with third-party integration."""
    
    def __init__(self):
        self.pending_verifications = {}
        self.verification_codes = {}
        self.third_party_enabled = True  # Enable third-party verification
    
    async def send_email_verification(self, user_id: str, email: str) -> bool:
        """Send email verification code."""
        try:
            # Generate verification code
            code = self._generate_verification_code()
            
            # Store code with expiration
            self.verification_codes[f"email_{user_id}"] = {
                "code": code,
                "email": email,
                "expires_at": datetime.utcnow() + timedelta(hours=24),
                "attempts": 0
            }
            
            # Send email notification
            await notification_service.send_email(
                to_email=email,
                subject="Verify your email - Paired",
                message=f"Your verification code is: {code}. This code expires in 24 hours."
            )
            
            return True
            
        except Exception as e:
            print(f"Failed to send email verification: {e}")
            return False
    
    async def send_phone_verification(self, user_id: str, phone: str) -> bool:
        """Send phone verification code."""
        try:
            # Generate verification code
            code = self._generate_verification_code()
            
            # Store code with expiration
            self.verification_codes[f"phone_{user_id}"] = {
                "code": code,
                "phone": phone,
                "expires_at": datetime.utcnow() + timedelta(minutes=30),
                "attempts": 0
            }
            
            # Send SMS notification
            await notification_service.send_sms(
                to_phone=phone,
                message=f"Your Paired verification code is: {code}. Valid for 30 minutes."
            )
            
            return True
            
        except Exception as e:
            print(f"Failed to send phone verification: {e}")
            return False
    
    async def verify_email_code(self, user_id: str, code: str) -> bool:
        """Verify email verification code."""
        verification_key = f"email_{user_id}"
        verification_data = self.verification_codes.get(verification_key)
        
        if not verification_data:
            return False
        
        # Check if expired
        if datetime.utcnow() > verification_data["expires_at"]:
            del self.verification_codes[verification_key]
            return False
        
        # Check attempts
        verification_data["attempts"] += 1
        if verification_data["attempts"] > 3:
            del self.verification_codes[verification_key]
            return False
        
        # Verify code
        if verification_data["code"] == code:
            del self.verification_codes[verification_key]
            return True
        
        return False
    
    async def verify_phone_code(self, user_id: str, code: str) -> bool:
        """Verify phone verification code."""
        verification_key = f"phone_{user_id}"
        verification_data = self.verification_codes.get(verification_key)
        
        if not verification_data:
            return False
        
        # Check if expired
        if datetime.utcnow() > verification_data["expires_at"]:
            del self.verification_codes[verification_key]
            return False
        
        # Check attempts
        verification_data["attempts"] += 1
        if verification_data["attempts"] > 3:
            del self.verification_codes[verification_key]
            return False
        
        # Verify code
        if verification_data["code"] == code:
            del self.verification_codes[verification_key]
            return True
        
        return False
    
    async def initiate_identity_verification(self, user_id: str, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Initiate identity verification using third-party service.
        
        Args:
            user_id: User ID
            user_data: User information for verification
            
        Returns:
            Verification initiation result
        """
        if not self.third_party_enabled:
            return {
                "success": False,
                "error": "Third-party verification not enabled",
                "verification_id": None
            }
        
        try:
            result = await third_party_verification_service.initiate_identity_verification(
                user_id, user_data
            )
            
            # Store verification in pending list
            if result.get("success") and result.get("verification_id"):
                self.pending_verifications[result["verification_id"]] = {
                    "user_id": user_id,
                    "type": VerificationType.IDENTITY,
                    "initiated_at": datetime.utcnow(),
                    "status": VerificationStatus.PENDING
                }
            
            return result
            
        except Exception as e:
            print(f"Failed to initiate identity verification: {e}")
            return {
                "success": False,
                "error": str(e),
                "verification_id": None
            }
    
    async def initiate_background_check(self, user_id: str, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Initiate background check using third-party service.
        
        Args:
            user_id: User ID
            user_data: User information for background check
            
        Returns:
            Background check initiation result
        """
        if not self.third_party_enabled:
            return {
                "success": False,
                "error": "Third-party verification not enabled",
                "check_id": None
            }
        
        try:
            result = await third_party_verification_service.initiate_background_check(
                user_id, user_data
            )
            
            # Store verification in pending list
            if result.get("success") and result.get("check_id"):
                self.pending_verifications[result["check_id"]] = {
                    "user_id": user_id,
                    "type": VerificationType.BACKGROUND,
                    "initiated_at": datetime.utcnow(),
                    "status": VerificationStatus.PENDING
                }
            
            return result
            
        except Exception as e:
            print(f"Failed to initiate background check: {e}")
            return {
                "success": False,
                "error": str(e),
                "check_id": None
            }
    
    async def verify_document(self, user_id: str, document_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verify a document using third-party service.
        
        Args:
            user_id: User ID
            document_data: Document information and image data
            
        Returns:
            Document verification result
        """
        if not self.third_party_enabled:
            return {
                "success": False,
                "error": "Third-party verification not enabled",
                "document_valid": False
            }
        
        try:
            result = await third_party_verification_service.verify_document(
                user_id, document_data
            )
            
            return result
            
        except Exception as e:
            print(f"Failed to verify document: {e}")
            return {
                "success": False,
                "error": str(e),
                "document_valid": False
            }
    
    async def check_verification_status(self, verification_id: str) -> Dict[str, Any]:
        """
        Check the status of a pending verification.
        
        Args:
            verification_id: Verification ID
            
        Returns:
            Current verification status
        """
        pending_verification = self.pending_verifications.get(verification_id)
        
        if not pending_verification:
            return {
                "success": False,
                "error": "Verification not found",
                "status": VerificationStatus.FAILED.value
            }
        
        try:
            result = await third_party_verification_service.check_verification_status(
                verification_id, pending_verification["type"]
            )
            
            # Update local status
            if result.get("success"):
                pending_verification["status"] = VerificationStatus(result.get("status", "pending"))
                pending_verification["last_checked"] = datetime.utcnow()
            
            return result
            
        except Exception as e:
            print(f"Failed to check verification status: {e}")
            return {
                "success": False,
                "error": str(e),
                "status": VerificationStatus.FAILED.value
            }
    
    async def get_verification_result(self, verification_id: str) -> Dict[str, Any]:
        """
        Get the final result of a completed verification.
        
        Args:
            verification_id: Verification ID
            
        Returns:
            Verification result with details
        """
        pending_verification = self.pending_verifications.get(verification_id)
        
        if not pending_verification:
            return {
                "success": False,
                "error": "Verification not found"
            }
        
        try:
            result = await third_party_verification_service.get_verification_result(
                verification_id, pending_verification["type"]
            )
            
            # Remove from pending if completed
            if result.get("success") and result.get("status") == VerificationStatus.COMPLETED.value:
                self.pending_verifications.pop(verification_id, None)
            
            return result
            
        except Exception as e:
            print(f"Failed to get verification result: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def process_verification_webhook(self, provider: str, webhook_data: Dict[str, Any]) -> bool:
        """
        Process webhook notifications from verification providers.
        
        Args:
            provider: Verification provider name
            webhook_data: Webhook payload data
            
        Returns:
            Success status
        """
        try:
            verification_id = webhook_data.get("verification_id") or webhook_data.get("id")
            status = webhook_data.get("status")
            
            if not verification_id or not status:
                print(f"Invalid webhook data from {provider}: missing verification_id or status")
                return False
            
            # Update local verification status
            if verification_id in self.pending_verifications:
                self.pending_verifications[verification_id]["status"] = VerificationStatus(status)
                self.pending_verifications[verification_id]["webhook_received"] = datetime.utcnow()
            
            # Send notification to user if verification completed
            if status == VerificationStatus.COMPLETED.value:
                pending_verification = self.pending_verifications.get(verification_id)
                if pending_verification:
                    user_id = pending_verification["user_id"]
                    verification_type = pending_verification["type"]
                    
                    await notification_service.send_notification(
                        user_id=user_id,
                        title="Verification Completed",
                        message=f"Your {verification_type.value} verification has been completed successfully.",
                        notification_type="verification_complete"
                    )
            
            return True
            
        except Exception as e:
            print(f"Failed to process verification webhook: {e}")
            return False
    
    async def cleanup_expired_verifications(self):
        """Clean up expired verification codes and pending verifications."""
        current_time = datetime.utcnow()
        
        # Clean up verification codes
        expired_codes = []
        for key, data in self.verification_codes.items():
            if current_time > data["expires_at"]:
                expired_codes.append(key)
        
        for key in expired_codes:
            del self.verification_codes[key]
        
        # Clean up old pending verifications (older than 30 days)
        expired_verifications = []
        for verification_id, data in self.pending_verifications.items():
            if current_time - data["initiated_at"] > timedelta(days=30):
                expired_verifications.append(verification_id)
        
        for verification_id in expired_verifications:
            del self.pending_verifications[verification_id]
        
        if expired_codes or expired_verifications:
            print(f"Cleaned up {len(expired_codes)} expired codes and {len(expired_verifications)} old verifications")
    
    def _generate_verification_code(self, length: int = 6) -> str:
        """Generate a random verification code."""
        import random
        import string
        return ''.join(random.choices(string.digits, k=length))
    
    def get_verification_stats(self) -> Dict[str, Any]:
        """Get verification service statistics."""
        return {
            "pending_verifications": len(self.pending_verifications),
            "active_codes": len(self.verification_codes),
            "third_party_enabled": self.third_party_enabled,
            "verification_types": {
                verification_type.value: sum(
                    1 for v in self.pending_verifications.values() 
                    if v["type"] == verification_type
                ) for verification_type in VerificationType
            }
        }

verification_service = VerificationService() 