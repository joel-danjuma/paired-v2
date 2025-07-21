from sqlalchemy import create_engine, MetaData, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.pool import NullPool
import os
from typing import AsyncGenerator

# Database configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql+asyncpg://paired_user:paired_password@localhost:5432/paired_db"
)

# Ensure the database URL is configured for asyncpg
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=True,  # Set to False in production
    poolclass=NullPool
)

# Create async session maker
async_session_maker = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Create base class for models
Base = declarative_base()

# Metadata for migrations
metadata = MetaData()

async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency to get database session"""
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    """Initialize database tables"""
    async with engine.begin() as conn:
        # Try to enable PostGIS and pgvector extensions, but don't fail if they're not available
        # This allows the app to work on managed databases like Render that don't support these extensions
        try:
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
            print("PostGIS extension enabled")
        except Exception as e:
            print(f"PostGIS extension not available (likely on managed database): {e}")
        
        try:
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            print("pgvector extension enabled")
        except Exception as e:
            print(f"pgvector extension not available (likely on managed database): {e}")
        
        # Create all tables
        try:
            await conn.run_sync(Base.metadata.create_all)
            print("Database tables created successfully")
        except Exception as e:
            print(f"Error creating database tables: {e}")
            raise 