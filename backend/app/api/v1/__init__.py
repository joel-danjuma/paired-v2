from fastapi import APIRouter
from .auth import router as auth_router
from .users import router as users_router
from .listings import router as listings_router
from .matches import router as matches_router
from .conversations import router as conversations_router
from .agent import router as agent_router
from .notifications import router as notifications_router
from .admin import router as admin_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(listings_router, prefix="/listings", tags=["listings"])
api_router.include_router(matches_router, prefix="/matches", tags=["matches"])
api_router.include_router(conversations_router, prefix="/conversations", tags=["conversations"])
api_router.include_router(agent_router, prefix="/agent", tags=["agent"])
api_router.include_router(notifications_router, prefix="/notifications", tags=["notifications"])
api_router.include_router(admin_router, prefix="/admin", tags=["admin"]) 