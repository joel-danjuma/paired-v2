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
        
        # Check if listings table exists and has geometry column
        try:
            result = await conn.execute(text("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'listings' AND column_name = 'location'
            """))
            location_column = result.fetchone()
            
            if location_column and 'geometry' in str(location_column[1]).lower():
                print("Found geometry column in listings table, converting to varchar...")
                # Convert geometry column to varchar to avoid type conflicts
                try:
                    await conn.execute(text("""
                        ALTER TABLE listings 
                        ALTER COLUMN location TYPE VARCHAR(500) 
                        USING ST_AsText(location)::VARCHAR(500)
                    """))
                    print("Successfully converted location column from geometry to varchar")
                except Exception as e:
                    print(f"Could not convert location column (trying alternative): {e}")
                    # Alternative: drop and recreate column
                    try:
                        await conn.execute(text("ALTER TABLE listings DROP COLUMN location"))
                        await conn.execute(text("ALTER TABLE listings ADD COLUMN location VARCHAR(500)"))
                        print("Dropped and recreated location column as varchar")
                    except Exception as e2:
                        print(f"Could not fix location column: {e2}")
            else:
                print("Location column is already varchar or doesn't exist")
                
        except Exception as e:
            print(f"Could not check/fix location column: {e}")
        
        # Create all tables
        try:
            await conn.run_sync(Base.metadata.create_all)
            print("Database tables created successfully")
        except Exception as e:
            print(f"Error creating database tables: {e}")
            raise 