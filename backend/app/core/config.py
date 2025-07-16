from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    # Application
    app_name: str = "Paired Backend API"
    version: str = "1.0.0"
    environment: str = "development"
    debug: bool = True
    
    # Database
    database_url: str = "postgresql+asyncpg://paired_user:paired_password@localhost:5432/paired_db"
    
    # Redis
    redis_url: str = "redis://localhost:6379"
    
    # JWT
    jwt_secret_key: str = "your-super-secret-jwt-key-change-this-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    
    # Google Gemini API
    google_api_key: str
    google_project_id: Optional[str] = None
    
    # OpenAI API
    openai_api_key: Optional[str] = None
    
    # LangSmith
    langchain_api_key: Optional[str] = None
    langchain_project: str = "paired-backend"
    
    # Email
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    
    # Twilio
    twilio_account_sid: Optional[str] = None
    twilio_auth_token: Optional[str] = None
    twilio_phone_number: Optional[str] = None
    
    # AWS S3
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    aws_region: str = "us-east-1"
    aws_s3_bucket: Optional[str] = None
    
    # CORS
    cors_origins: List[str] = [
        "http://localhost:3000", 
        "http://localhost:5173",
        "https://paired-v2.onrender.com"
    ]
    
    # Trusted Hosts for Host Header validation
    trusted_hosts: List[str] = ["localhost", "127.0.0.1", "*.onrender.com", "*.paired.com", "paired.com"]
    
    # Admin User
    admin_email: Optional[str] = None
    admin_password: Optional[str] = None

    # Third-party services
    checkr_api_key: Optional[str] = None
    stripe_secret_key: Optional[str] = None
    stripe_webhook_secret: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Create settings instance
settings = Settings() 