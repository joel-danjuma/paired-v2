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
# This makes it work consistently whether run locally or in production
if settings.environment == "production":
    STATIC_DIR = "/app/static"
else:
    STATIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting up Paired Backend API...")
    await init_db()
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

# Include API routes FIRST - this ensures they take priority
app.include_router(api_router, prefix="/api/v1")

# Add a health check endpoint for deployment monitoring
@app.get("/api/v1/health")
async def health_check():
    return {"status": "healthy", "service": "paired-backend"}

# Custom middleware to handle static files without interfering with API routes
@app.middleware("http")
async def serve_static_files(request: Request, call_next):
    # If it's an API request, let it pass through normally
    if request.url.path.startswith("/api/"):
        return await call_next(request)
    
    # For non-API requests, serve static files
    try:
        response = await call_next(request)
        # If the route wasn't found (404), serve index.html for SPA routing
        if response.status_code == 404 and os.path.exists(STATIC_DIR):
            index_path = os.path.join(STATIC_DIR, "index.html")
            if os.path.exists(index_path):
                return FileResponse(index_path)
        return response
    except Exception:
        # If static directory exists and this is not an API route, serve index.html
        if os.path.exists(STATIC_DIR):
            index_path = os.path.join(STATIC_DIR, "index.html")
            if os.path.exists(index_path):
                return FileResponse(index_path)
        raise HTTPException(status_code=404, detail="Not found")

# Mount static files at /static to serve assets
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Root endpoint fallback
@app.get("/")
async def root():
    if os.path.exists(STATIC_DIR):
        index_path = os.path.join(STATIC_DIR, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
    return {"message": "Paired Backend API", "docs": "/docs", "health": "/api/v1/health"} 