from fastapi import FastAPI, Request, Response
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import os

from app.core.config import settings
from app.models import init_db
from app.api.v1 import api_router
from app.middleware.performance import PerformanceMiddleware
from app.models.user import User, UserType
from app.core.security import get_password_hash
from app.models.database import get_db_session
from sqlalchemy.future import select


# Adjust DATABASE_URL for async driver
if settings.database_url and settings.database_url.startswith("postgresql://"):
    settings.database_url = settings.database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Define the path for static files relative to the project root
# This makes it work consistently whether run locally or in production
if settings.environment == "production":
    STATIC_DIR = "/app/static"
else:
    STATIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

async def create_admin_user():
    """Creates a default admin user if one doesn't exist."""
    async for db in get_db_session():
        admin_email = settings.admin_email
        admin_password = settings.admin_password

        if not admin_email or not admin_password:
            print("Admin email or password not set, skipping admin user creation.")
            return

        result = await db.execute(select(User).filter(User.email == admin_email))
        if result.scalar_one_or_none() is None:
            hashed_password = get_password_hash(admin_password)
            admin_user = User(
                email=admin_email,
                password_hash=hashed_password,
                user_type=UserType.ADMIN,
                is_active=True,
                is_verified_email=True,
                first_name="Admin",
                last_name="User",
            )
            db.add(admin_user)
            await db.commit()
            print(f"Admin user {admin_email} created.")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting up Paired Backend API...")
    await init_db()
    await create_admin_user()
    print("Database initialized successfully")
    yield
    # Shutdown
    print("Shutting down Paired Backend API...")

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Backend API for Paired - Intelligent Roommate Matching Platform",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan
)

# Add performance monitoring middleware
app.add_middleware(PerformanceMiddleware)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add trusted host middleware for production
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.trusted_hosts
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

# Mount static files for the frontend
# This will serve index.html for any path that is not an API call or a file
app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static") 