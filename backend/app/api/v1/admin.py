from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.future import select
from app.core.deps import get_current_admin_user, get_db_session
from app.models.user import User
from app.schemas.user import User as UserSchema
from pydantic import BaseModel

class UserVerificationRequest(BaseModel):
    user_id: str
    is_verified: bool

router = APIRouter()

@router.get("/test", response_model=dict)
async def test_admin_route(
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Test endpoint to ensure admin authentication is working.
    """
    return {"message": f"Welcome, admin {current_admin.email}!"}

@router.get("/users", response_model=List[UserSchema])
async def get_all_users(
    db: get_db_session = Depends(),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Get a list of all users.
    """
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    return users

@router.post("/users/verify")
async def verify_user(
    verification_request: UserVerificationRequest,
    db: get_db_session = Depends(),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Update a user's verification status.
    """
    user_id = verification_request.user_id
    is_verified = verification_request.is_verified

    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_verified_identity = is_verified
    await db.commit()
    return {"message": f"User {user.email} verification status updated to {is_verified}."} 