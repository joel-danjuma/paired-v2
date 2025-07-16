from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from app.models.database import get_db_session
from app.models.user import User
from app.models.match import Match, MatchStatus
from app.schemas.match import MatchRecommendation, MatchAction, Match
from app.schemas.user import UserPublicProfile
from app.core.deps import get_current_user
from app.services import matching_service
from app.services.behavior_tracking import behavior_tracking_service

router = APIRouter()

@router.get("/recommendations", response_model=List[MatchRecommendation])
async def get_match_recommendations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
    limit: int = 10,
    method: str = "hybrid"
):
    """Get personalized match recommendations using hybrid approach."""
    
    # Get collaborative filtering recommendations
    collab_recs = await behavior_tracking_service.get_collaborative_recommendations(
        str(current_user.id), method="hybrid", n_recommendations=limit
    )
    
    # If we have collaborative filtering recommendations, use them
    if collab_recs:
        recommendations = []
        
        for rec in collab_recs:
            # Get user data
            result = await db.execute(select(User).where(User.id == rec["user_id"]))
            user = result.scalar_one_or_none()
            
            if user and user.is_active:
                recommendations.append(
                    MatchRecommendation(
                        user=UserPublicProfile.from_user(user),
                        compatibility_score=rec["score"]
                    )
                )
        
        if recommendations:
            return recommendations
    
    # Fallback to traditional ML/rule-based matching
    # Get all users for now (in production, this would be optimized)
    result = await db.execute(select(User).limit(100))
    potential_matches = result.scalars().all()
    
    # Calculate compatibility scores
    matches = matching_service.find_matches_for_user(current_user, potential_matches)
    
    # Convert to response model
    recommendations = []
    for match in matches[:limit]:
        recommendations.append(
            MatchRecommendation(
                user=UserPublicProfile.from_user(match["user"]),
                compatibility_score=match["compatibility_score"]
            )
        )
        
    return recommendations

@router.get("/search", response_model=List[MatchRecommendation])
async def search_matches(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
    query: Optional[str] = None,
    location: Optional[str] = None,
    limit: int = 20
):
    """Search for matches with query and location filters."""
    # In a real implementation, you would have a more sophisticated search
    # that uses the query and location to filter users from the database.
    # For now, we'll just get all users and filter them.
    
    result = await db.execute(select(User).limit(100)) # Simplified for now
    potential_matches = result.scalars().all()
    
    # Filter by location if provided
    if location and location != "all":
        potential_matches = [
            p for p in potential_matches 
            if p.city and location.lower() in p.city.lower()
        ]

    # Filter by search query (name, bio, etc.)
    if query:
        potential_matches = [
            p for p in potential_matches
            if (p.first_name and query.lower() in p.first_name.lower()) or \
               (p.bio and query.lower() in p.bio.lower())
        ]
        
    # Calculate compatibility scores
    matches = matching_service.find_matches_for_user(current_user, potential_matches)
    
    # Convert to response model
    recommendations = []
    for match in matches[:limit]:
        recommendations.append(
            MatchRecommendation(
                user=UserPublicProfile.from_user(match["user"]),
                compatibility_score=match["compatibility_score"]
            )
        )
        
    return recommendations

@router.get("/recommendations/collaborative")
async def get_collaborative_recommendations(
    current_user: User = Depends(get_current_user),
    method: str = "hybrid",
    limit: int = 10
):
    """Get recommendations specifically from collaborative filtering."""
    recommendations = await behavior_tracking_service.get_collaborative_recommendations(
        str(current_user.id), method=method, n_recommendations=limit
    )
    
    return {
        "method": method,
        "recommendations": recommendations,
        "model_info": behavior_tracking_service.get_model_info()
    }

@router.post("/{user_id}/action", status_code=status.HTTP_204_NO_CONTENT)
async def perform_match_action(
    user_id: str,
    action_data: MatchAction,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Perform an action on a match (accept, decline, etc.) with behavior tracking."""
    
    # Record the interaction for collaborative filtering
    await behavior_tracking_service.record_user_interaction(
        str(current_user.id), user_id, action_data.action, db
    )
    
    # Find or create match record
    result = await db.execute(
        select(Match).where(
            (Match.user_id == current_user.id) & (Match.target_id == user_id)
        )
    )
    match = result.scalar_one_or_none()
    
    if not match:
        # Create new match record
        match = Match(
            user_id=current_user.id,
            target_id=user_id,
            compatibility_score=0.5,  # Default score
            algorithm_version="v2_with_collaborative"
        )
        db.add(match)

    # Update match status based on action
    if action_data.action == "accept":
        match.user_action = "accepted"
        
        # Check for mutual match
        result = await db.execute(
            select(Match).where(
                (Match.user_id == user_id) & (Match.target_id == current_user.id)
            )
        )
        other_match = result.scalar_one_or_none()
        
        if other_match and other_match.user_action == "accepted":
            match.status = MatchStatus.MUTUAL
            other_match.status = MatchStatus.MUTUAL
            db.add(other_match)
            
    elif action_data.action == "decline":
        match.status = MatchStatus.DECLINED
        match.user_action = "declined"
    elif action_data.action == "like":
        match.user_action = "liked"

    db.add(match)
    await db.commit()
    
    return None

@router.post("/update-collaborative-model")
async def update_collaborative_model(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Update the collaborative filtering model with latest data."""
    success = await behavior_tracking_service.update_collaborative_filter(db)
    
    return {
        "success": success,
        "model_info": behavior_tracking_service.get_model_info()
    }

@router.get("/model-stats")
async def get_model_statistics(
    current_user: User = Depends(get_current_user)
):
    """Get statistics about the recommendation models."""
    return {
        "collaborative_filtering": behavior_tracking_service.get_model_info(),
        "ml_models": matching_service.use_ml,
        "active_approach": "hybrid" if behavior_tracking_service.get_model_info().get("status") == "fitted" else "ml_rule_based"
    } 