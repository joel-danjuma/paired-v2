from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, Dict, Any, List
from datetime import datetime, date

class IdentityDocumentUpload(BaseModel):
    document_type: str = Field(..., description="Type of document (e.g., 'passport', 'drivers_license')")
    document_number: Optional[str] = Field(None, description="Document number")
    name: Optional[str] = Field(None, description="Full name on document")
    date_of_birth: Optional[str] = Field(None, description="Date of birth on document")
    # In a real app, this would include file upload fields

class VerificationResult(BaseModel):
    is_valid: bool
    confidence_score: float
    document_type: str
    extracted_data: Dict[str, Any]
    verified_at: datetime

class EmailVerificationRequest(BaseModel):
    email: EmailStr

class PhoneVerificationRequest(BaseModel):
    phone: str
    
    @validator('phone')
    def validate_phone(cls, v):
        # Basic phone validation
        import re
        phone_pattern = r'^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$'
        if not re.match(phone_pattern, v.replace(' ', '')):
            raise ValueError('Invalid phone number format')
        return v

class VerificationCodeRequest(BaseModel):
    code: str
    
    @validator('code')
    def validate_code(cls, v):
        if not v.isdigit() or len(v) != 6:
            raise ValueError('Verification code must be 6 digits')
        return v

class IdentityVerificationRequest(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: Optional[date] = None
    address: Optional[Dict[str, str]] = None
    
    @validator('first_name', 'last_name')
    def validate_names(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError('Names must be at least 2 characters long')
        return v.strip()

class BackgroundCheckRequest(BaseModel):
    first_name: str
    last_name: str
    middle_name: Optional[str] = None
    date_of_birth: date
    ssn: str  # Handle securely in production
    address: Dict[str, str]
    previous_addresses: Optional[List[Dict[str, str]]] = None
    check_types: Optional[List[str]] = None
    
    @validator('ssn')
    def validate_ssn(cls, v):
        # Basic SSN validation (in production, use proper encryption)
        import re
        ssn_pattern = r'^\d{3}-?\d{2}-?\d{4}$'
        if not re.match(ssn_pattern, v.replace('-', '')):
            raise ValueError('Invalid SSN format')
        return v

class DocumentVerificationRequest(BaseModel):
    document_type: str  # passport, driver_license, national_id, etc.
    image_front: str    # Base64 encoded image
    image_back: Optional[str] = None  # Base64 encoded image for back side
    holder_name: str
    country: Optional[str] = "US"
    
    @validator('document_type')
    def validate_document_type(cls, v):
        valid_types = ['passport', 'driver_license', 'national_id', 'state_id']
        if v not in valid_types:
            raise ValueError(f'Document type must be one of: {", ".join(valid_types)}')
        return v
    
    @validator('image_front', 'image_back')
    def validate_image(cls, v):
        if v and not v.startswith('data:image/'):
            raise ValueError('Image must be a valid base64 data URL')
        return v

class VerificationResponse(BaseModel):
    success: bool
    message: str
    verification_id: Optional[str] = None
    redirect_url: Optional[str] = None
    status: Optional[str] = None

class VerificationStatusResponse(BaseModel):
    verification_id: str
    status: str
    updated_at: Optional[str] = None
    message: str

class VerificationResultResponse(BaseModel):
    verification_id: str
    status: str
    result: Dict[str, Any]
    completed_at: Optional[str] = None
    message: str

class EmailVerificationConfirm(BaseModel):
    token: str = Field(..., description="Email verification token")

class VerificationStatus(BaseModel):
    is_verified_email: bool
    is_verified_phone: bool
    is_verified_identity: bool
    is_background_checked: bool
    verification_details: Optional[Dict[str, Any]] = None 