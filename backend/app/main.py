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

# Add a simple root health check that doesn't require database
@app.get("/")
async def root_health_check():
    return {
        "status": "api_running",
        "message": "Paired Backend API is running",
        "environment": settings.environment,
        "debug": settings.debug
    }

# Include API routes
app.include_router(api_router, prefix="/api/v1")

# Add health check endpoint for deployment monitoring
@app.get("/api/v1/health")
async def health_check():
    return {"status": "healthy", "service": "paired-backend"}

# Serve static files for frontend (production only)
if settings.environment == "production" and os.path.exists(STATIC_DIR):
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
elif os.path.exists(STATIC_DIR):
    print(f"Static directory found: {STATIC_DIR}")
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
else:
    print(f"Static directory not found: {STATIC_DIR}")

# Catch-all route for SPA frontend routing (must be last)
@app.get("/{path:path}")
async def serve_frontend(path: str):
    """Serve frontend application for client-side routing"""
    if settings.environment == "production":
        static_file = os.path.join(STATIC_DIR, "index.html")
        if os.path.exists(static_file):
            return FileResponse(static_file)
    
    raise HTTPException(status_code=404, detail="Not found") 