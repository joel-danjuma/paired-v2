from fastapi import FastAPI, Request, Response, HTTPException
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

# Adjust DATABASE_URL for async driver
if settings.database_url and settings.database_url.startswith("postgresql://"):
    settings.database_url = settings.database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Define the path for static files relative to the project root
if settings.environment == "production":
    STATIC_DIR = "/app/static"
else:
    STATIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting up Paired Backend API...")
    try:
        await init_db()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Database initialization failed: {e}")
        # Don't fail startup completely - let app start for debugging
        print("Continuing startup without database...")
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

# Include API routes FIRST (these take precedence)
app.include_router(api_router, prefix="/api/v1")

# Add health check endpoints under /api/v1 to avoid conflicts
@app.get("/api/v1/health")
async def health_check():
    return {"status": "healthy", "service": "paired-backend"}

@app.get("/api/v1/status")
async def api_status():
    return {
        "status": "api_running",
        "message": "Paired Backend API is running",
        "environment": settings.environment,
        "debug": settings.debug
    }

# Serve static files for frontend (this should be AFTER API routes)
if os.path.exists(STATIC_DIR):
    print(f"Mounting static files from: {STATIC_DIR}")
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
else:
    print(f"Static directory not found: {STATIC_DIR}")
    
    # Fallback root endpoint if no static files
    @app.get("/")
    async def root_fallback():
        return {
            "message": "Paired Backend API - Frontend not found",
            "api_docs": "/docs",
            "api_health": "/api/v1/health",
            "static_dir": STATIC_DIR,
            "static_exists": False
        } 