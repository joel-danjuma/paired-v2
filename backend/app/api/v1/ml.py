from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List

from app.models.database import get_db_session
from app.models.user import User
from app.core.deps import get_current_user, require_user_type
from app.ml.models import model_manager
from app.services.ml_data_service import ml_data_service
from app.services.matching import matching_service
from app.services.content_recommendation import content_recommendation_service

router = APIRouter()

@router.post("/train")
async def train_ml_model(
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_user_type("agent"))  # Only agents can train models
):
    """Train a new ML model for compatibility prediction."""
    
    async def train_model_task():
        try:
            # Collect training data
            training_data = await ml_data_service.collect_training_data(db)
            
            # If not enough real data, supplement with synthetic data
            if len(training_data) < 100:
                synthetic_data = await ml_data_service.generate_synthetic_training_data(500)
                training_data.extend(synthetic_data)
            
            # Create and train model
            model = model_manager.create_model("main_model", "random_forest")
            metrics = model.train(training_data)
            
            # Set as active model if training successful
            if metrics["val_r2"] > 0.5:  # Minimum R² threshold
                model_manager.set_active_model("main_model")
                matching_service.enable_ml_matching()
                
                # Save model
                model.save_model("models/main_model.joblib")
            
            print(f"Model training completed. Metrics: {metrics}")
            
        except Exception as e:
            print(f"Model training failed: {e}")
    
    background_tasks.add_task(train_model_task)
    
    return {"message": "Model training started in background"}

@router.get("/models")
async def get_model_info(
    current_user: User = Depends(get_current_user)
):
    """Get information about available ML models."""
    return model_manager.get_model_info()

@router.post("/models/{model_name}/activate")
async def activate_model(
    model_name: str,
    current_user: User = Depends(require_user_type("agent"))
):
    """Activate a specific ML model."""
    try:
        model_manager.set_active_model(model_name)
        matching_service.enable_ml_matching()
        return {"message": f"Model '{model_name}' activated successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/models/disable")
async def disable_ml_models(
    current_user: User = Depends(require_user_type("agent"))
):
    """Disable ML models and use rule-based matching."""
    matching_service.disable_ml_matching()
    return {"message": "ML models disabled, using rule-based matching"}

@router.get("/feature-importance")
async def get_feature_importance(
    current_user: User = Depends(require_user_type("agent"))
):
    """Get feature importance from the active ML model."""
    if not model_manager.active_model:
        raise HTTPException(
            status_code=400, 
            detail="No active ML model available"
        )
    
    try:
        importance = model_manager.active_model.get_feature_importance()
        return {"feature_importance": importance}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get feature importance: {e}"
        )

@router.post("/predict")
async def predict_compatibility(
    user1_id: str,
    user2_id: str,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Predict compatibility between two users using ML model."""
    if not model_manager.active_model:
        raise HTTPException(
            status_code=400,
            detail="No active ML model available"
        )
    
    # Get users
    from sqlalchemy import select
    
    result1 = await db.execute(select(User).where(User.id == user1_id))
    result2 = await db.execute(select(User).where(User.id == user2_id))
    
    user1 = result1.scalar_one_or_none()
    user2 = result2.scalar_one_or_none()
    
    if not user1 or not user2:
        raise HTTPException(status_code=404, detail="One or both users not found")
    
    try:
        score = matching_service.calculate_compatibility(user1, user2)
        return {
            "user1_id": user1_id,
            "user2_id": user2_id,
            "compatibility_score": score,
            "model_used": "ML" if matching_service.use_ml else "Rule-based"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {e}"
        )

# Content-Based Filtering Endpoints

@router.post("/content/update-profiles")
async def update_content_profiles(
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_user_type("agent"))
):
    """Update content-based filtering profiles."""
    
    async def update_profiles_task():
        try:
            # Update user profiles
            user_success = await content_recommendation_service.update_user_profiles(db)
            
            # Update listing profiles
            listing_success = await content_recommendation_service.update_listing_profiles(db)
            
            print(f"Content profiles updated - Users: {user_success}, Listings: {listing_success}")
            
        except Exception as e:
            print(f"Failed to update content profiles: {e}")
    
    background_tasks.add_task(update_profiles_task)
    
    return {"message": "Content profile update started in background"}

@router.get("/content/recommendations/{user_id}")
async def get_content_recommendations(
    user_id: str,
    target_user_type: str = Query(None, description="Filter by user type (seeker/provider)"),
    limit: int = Query(10, description="Number of recommendations"),
    current_user: User = Depends(get_current_user)
):
    """Get content-based user recommendations."""
    recommendations = await content_recommendation_service.get_user_recommendations(
        user_id, target_user_type, limit
    )
    
    return {
        "user_id": user_id,
        "recommendations": recommendations,
        "total": len(recommendations)
    }

@router.get("/content/recommendations/hybrid/{user_id}")
async def get_hybrid_content_recommendations(
    user_id: str,
    target_user_type: str = Query(None, description="Filter by user type"),
    limit: int = Query(10, description="Number of recommendations"),
    content_weight: float = Query(0.4, description="Weight for content-based recommendations"),
    current_user: User = Depends(get_current_user)
):
    """Get hybrid recommendations with content-based filtering."""
    recommendations = await content_recommendation_service.get_hybrid_user_recommendations(
        user_id, target_user_type, limit, content_weight
    )
    
    return {
        "user_id": user_id,
        "method": "hybrid_content",
        "content_weight": content_weight,
        "recommendations": recommendations,
        "total": len(recommendations)
    }

@router.get("/content/similar-listings/{listing_id}")
async def get_similar_listings(
    listing_id: str,
    limit: int = Query(10, description="Number of recommendations"),
    current_user: User = Depends(get_current_user)
):
    """Get similar listings based on content."""
    recommendations = await content_recommendation_service.get_listing_recommendations(
        listing_id, limit
    )
    
    return {
        "listing_id": listing_id,
        "recommendations": recommendations,
        "total": len(recommendations)
    }

@router.post("/content/find-by-interests")
async def find_users_by_interests(
    interests: List[str],
    limit: int = Query(10, description="Number of results"),
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Find users with similar interests."""
    if not interests:
        raise HTTPException(status_code=400, detail="At least one interest must be provided")
    
    recommendations = await content_recommendation_service.find_users_by_interests(
        interests, db, limit
    )
    
    return {
        "interests": interests,
        "recommendations": recommendations,
        "total": len(recommendations)
    }

@router.get("/content/stats")
async def get_content_stats(
    current_user: User = Depends(get_current_user)
):
    """Get content-based filtering statistics."""
    return content_recommendation_service.get_model_stats() 