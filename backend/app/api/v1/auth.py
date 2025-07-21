from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from datetime import timedelta

from app.models.database import get_db_session
from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin, Token, RefreshToken
from app.core.security import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    create_refresh_token,
    verify_token
)
from app.core.config import settings
from app.services import notification_service

router = APIRouter()

@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db_session)):
    """Health check endpoint to test database connectivity"""
    try:
        # Test database connection
        result = await db.execute(text("SELECT 1"))
        db_status = "connected" if result.scalar() == 1 else "error"
        
        # Test user table exists
        try:
            user_count = await db.execute(text("SELECT COUNT(*) FROM users"))
            user_table_status = f"exists ({user_count.scalar()} users)"
        except Exception as e:
            user_table_status = f"error: {str(e)}"
        
        return {
            "status": "healthy",
            "database": db_status,
            "user_table": user_table_status,
            "environment": settings.environment,
            "debug": settings.debug
        }
    except Exception as e:
        import traceback
        return {
            "status": "unhealthy",
            "error": str(e),
            "traceback": traceback.format_exc()
        }

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserRegister,
    db: AsyncSession = Depends(get_db_session)
):
    """Register a new user"""
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        # If user exists but is inactive (soft deleted), reactivate them
        if not existing_user.is_active:
            # Reactivate the account with new data
            existing_user.is_active = True
            existing_user.password_hash = get_password_hash(user_data.password)
            existing_user.first_name = user_data.first_name
            existing_user.last_name = user_data.last_name
            existing_user.user_type = user_data.user_type
            existing_user.phone = user_data.phone
            
            # Reset verification status since it's essentially a new registration
            existing_user.is_verified_email = False
            existing_user.is_verified_phone = False
            
            await db.commit()
            await db.refresh(existing_user)
            
            # Send welcome email for reactivated account
            try:
                await notification_service.send_welcome_email(
                    existing_user.email, 
                    existing_user.first_name or "User"
                )
            except Exception as e:
                print(f"Failed to send welcome email: {e}")
            
            # Create tokens for reactivated account
            access_token = create_access_token(data={"sub": str(existing_user.id)})
            refresh_token = create_refresh_token(data={"sub": str(existing_user.id)})
            
            return Token(
                access_token=access_token,
                refresh_token=refresh_token,
                expires_in=settings.jwt_expiration_hours * 3600
            )
        else:
            # User exists and is active - cannot register again
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        password_hash=hashed_password,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        user_type=user_data.user_type,
        phone=user_data.phone
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # Send welcome email
    try:
        await notification_service.send_welcome_email(
            new_user.email, 
            new_user.first_name or "User"
        )
    except Exception as e:
        print(f"Failed to send welcome email: {e}")
        # Don't fail registration if email fails
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(new_user.id)})
    refresh_token = create_refresh_token(data={"sub": str(new_user.id)})
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.jwt_expiration_hours * 3600
    )

@router.post("/login", response_model=Token)
async def login(
    user_credentials: UserLogin,
    db: AsyncSession = Depends(get_db_session)
):
    """Login user and return JWT tokens"""
    try:
        print(f"Login attempt for email: {user_credentials.email}")
        
        # Get user by email
        try:
            result = await db.execute(select(User).where(User.email == user_credentials.email))
            user = result.scalar_one_or_none()
            print(f"User found: {user is not None}")
        except Exception as e:
            print(f"Database query failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database connection error"
            )
        
        if not user:
            print(f"User not found for email: {user_credentials.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verify password
        try:
            password_valid = verify_password(user_credentials.password, user.password_hash)
            print(f"Password valid: {password_valid}")
        except Exception as e:
            print(f"Password verification failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Authentication system error"
            )
        
        if not password_valid:
            print(f"Invalid password for email: {user_credentials.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
            print(f"Inactive account for email: {user_credentials.email}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated"
            )
        
        # Create tokens
        try:
            access_token = create_access_token(data={"sub": str(user.id)})
            refresh_token = create_refresh_token(data={"sub": str(user.id)})
            print(f"Tokens created successfully for user: {user.id}")
        except Exception as e:
            print(f"Token creation failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Token generation error"
            )
        
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.jwt_expiration_hours * 3600
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        import traceback
        error_traceback = traceback.format_exc()
        print(f"Unexpected error in login: {e}")
        print(f"Full traceback: {error_traceback}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login system error: {str(e)}"
        )

@router.post("/refresh", response_model=Token)
async def refresh_token(
    token_data: RefreshToken,
    db: AsyncSession = Depends(get_db_session)
):
    """Refresh access token using refresh token"""
    try:
        payload = verify_token(token_data.refresh_token)
        
        # Check if it's a refresh token
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Verify user exists and is active
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        # Create new tokens
        access_token = create_access_token(data={"sub": str(user.id)})
        new_refresh_token = create_refresh_token(data={"sub": str(user.id)})
        
        return Token(
            access_token=access_token,
            refresh_token=new_refresh_token,
            expires_in=settings.jwt_expiration_hours * 3600
        )
        
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        ) 