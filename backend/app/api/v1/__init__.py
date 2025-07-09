from fastapi import APIRouter
from .auth import router as auth_router
from .users import router as users_router
from .listings import router as listings_router
from .matches import router as matches_router
from .conversations import router as conversations_router
from .agent import router as agent_router
from .ml import router as ml_router
from .verification import router as verification_router

api_router = APIRouter()

# Include all routers
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users_router, prefix="/users", tags=["Users"])
api_router.include_router(listings_router, prefix="/listings", tags=["Listings"])
api_router.include_router(matches_router, prefix="/matches", tags=["Matches"])
api_router.include_router(conversations_router, prefix="/conversations", tags=["Conversations"])
api_router.include_router(agent_router, prefix="/agent", tags=["AI Agent"])
api_router.include_router(ml_router, prefix="/ml", tags=["Machine Learning"])
api_router.include_router(verification_router, prefix="/verification", tags=["Verification"]) 