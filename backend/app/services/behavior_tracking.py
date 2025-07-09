from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta
from app.models.user import User
from app.models.match import Match, MatchStatus
from app.models.conversation import Conversation, Message
from app.ml.collaborative_filtering import collaborative_filter

class BehaviorTrackingService:
    """Service for tracking user behavior and generating implicit ratings."""
    
    def __init__(self):
        self.rating_weights = {
            "profile_view": 0.1,
            "match_like": 0.7,
            "match_accept": 1.0,
            "message_sent": 0.8,
            "conversation_length": 0.3,
            "response_speed": 0.2
        }
    
    async def collect_user_interactions(self, db: AsyncSession) -> List[Dict[str, Any]]:
        """
        Collect user interactions and convert them to ratings for collaborative filtering.
        
        Returns:
            List of interaction dictionaries with user_id, target_id, and rating
        """
        interactions = []
        
        # Get all matches and convert to ratings
        match_result = await db.execute(select(Match))
        matches = match_result.scalars().all()
        
        for match in matches:
            rating = await self._calculate_match_rating(db, match)
            if rating > 0:
                interactions.append({
                    "user_id": str(match.user_id),
                    "target_id": str(match.target_id),
                    "rating": rating,
                    "interaction_type": "match",
                    "timestamp": match.created_at
                })
        
        # Get conversation-based interactions
        conversation_result = await db.execute(select(Conversation))
        conversations = conversation_result.scalars().all()
        
        for conversation in conversations:
            if len(conversation.participants) == 2:
                ratings = await self._calculate_conversation_ratings(db, conversation)
                interactions.extend(ratings)
        
        return interactions
    
    async def _calculate_match_rating(self, db: AsyncSession, match: Match) -> float:
        """Calculate rating based on match status and outcome."""
        base_rating = 0.0
        
        # Base rating from match status
        if match.status == MatchStatus.MUTUAL:
            base_rating = 1.0
        elif match.status == MatchStatus.PENDING and match.user_action == "accepted":
            base_rating = 0.7
        elif match.status == MatchStatus.DECLINED:
            base_rating = 0.1  # Small positive rating for seeing the profile
        else:
            base_rating = 0.3  # Default for other interactions
        
        # Boost rating if there's a conversation
        conversation_result = await db.execute(
            select(Conversation).where(
                Conversation.participants.contains([match.user_id]) &
                Conversation.participants.contains([match.target_id])
            )
        )
        conversation = conversation_result.scalar_one_or_none()
        
        if conversation and conversation.message_count > 0:
            conversation_boost = min(0.3, conversation.message_count * 0.05)
            base_rating += conversation_boost
        
        return min(1.0, base_rating)
    
    async def _calculate_conversation_ratings(
        self, 
        db: AsyncSession, 
        conversation: Conversation
    ) -> List[Dict[str, Any]]:
        """Calculate mutual ratings based on conversation activity."""
        if len(conversation.participants) != 2:
            return []
        
        user1_id, user2_id = conversation.participants
        
        # Get conversation messages
        message_result = await db.execute(
            select(Message).where(Message.conversation_id == conversation.id)
        )
        messages = message_result.scalars().all()
        
        if not messages:
            return []
        
        # Calculate engagement for each user
        user1_messages = [m for m in messages if m.sender_id == user1_id]
        user2_messages = [m for m in messages if m.sender_id == user2_id]
        
        # Base rating from message participation
        user1_rating = self._calculate_message_rating(user1_messages, len(messages))
        user2_rating = self._calculate_message_rating(user2_messages, len(messages))
        
        # Boost for conversation length and duration
        conversation_duration = self._calculate_conversation_duration(messages)
        duration_boost = min(0.2, conversation_duration.days * 0.02)
        
        user1_rating += duration_boost
        user2_rating += duration_boost
        
        ratings = []
        
        if user1_rating > 0:
            ratings.append({
                "user_id": str(user1_id),
                "target_id": str(user2_id),
                "rating": min(1.0, user1_rating),
                "interaction_type": "conversation",
                "timestamp": conversation.created_at
            })
        
        if user2_rating > 0:
            ratings.append({
                "user_id": str(user2_id),
                "target_id": str(user1_id),
                "rating": min(1.0, user2_rating),
                "interaction_type": "conversation",
                "timestamp": conversation.created_at
            })
        
        return ratings
    
    def _calculate_message_rating(self, user_messages: List[Message], total_messages: int) -> float:
        """Calculate rating based on user's message participation."""
        if not user_messages or total_messages == 0:
            return 0.0
        
        # Base rating from participation ratio
        participation_ratio = len(user_messages) / total_messages
        base_rating = participation_ratio * 0.8
        
        # Bonus for message length and engagement
        avg_message_length = sum(len(m.content) for m in user_messages) / len(user_messages)
        length_bonus = min(0.2, avg_message_length / 500)  # Up to 0.2 for long messages
        
        return base_rating + length_bonus
    
    def _calculate_conversation_duration(self, messages: List[Message]) -> timedelta:
        """Calculate the duration of a conversation."""
        if len(messages) < 2:
            return timedelta(0)
        
        timestamps = [m.created_at for m in messages]
        return max(timestamps) - min(timestamps)
    
    async def update_collaborative_filter(self, db: AsyncSession):
        """Update the collaborative filtering model with latest user interactions."""
        try:
            # Collect latest interactions
            interactions = await self.collect_user_interactions(db)
            
            if len(interactions) < 10:  # Need minimum interactions
                print("Not enough interactions for collaborative filtering")
                return False
            
            # Fit the collaborative filtering model
            collaborative_filter.fit(interactions)
            
            print(f"Collaborative filtering updated with {len(interactions)} interactions")
            return True
            
        except Exception as e:
            print(f"Failed to update collaborative filtering: {e}")
            return False
    
    async def get_collaborative_recommendations(
        self, 
        user_id: str, 
        method: str = "hybrid",
        n_recommendations: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get recommendations using collaborative filtering.
        
        Args:
            user_id: Target user ID
            method: Recommendation method ("user_based", "item_based", "matrix_factorization", "hybrid")
            n_recommendations: Number of recommendations
            
        Returns:
            List of recommendation dictionaries
        """
        if not collaborative_filter.is_fitted:
            return []
        
        try:
            if method == "user_based":
                recs = collaborative_filter.get_user_based_recommendations(user_id, n_recommendations)
            elif method == "item_based":
                recs = collaborative_filter.get_item_based_recommendations(user_id, n_recommendations)
            elif method == "matrix_factorization":
                recs = collaborative_filter.get_matrix_factorization_recommendations(user_id, n_recommendations)
            else:  # hybrid
                recs = collaborative_filter.get_hybrid_recommendations(user_id, n_recommendations)
            
            # Format recommendations
            recommendations = []
            for target_user_id, score in recs:
                recommendations.append({
                    "user_id": target_user_id,
                    "score": float(score),
                    "method": method,
                    "recommendation_type": "collaborative_filtering"
                })
            
            return recommendations
            
        except Exception as e:
            print(f"Failed to get collaborative recommendations: {e}")
            return []
    
    async def record_user_interaction(
        self, 
        user_id: str, 
        target_id: str, 
        action: str,
        db: AsyncSession
    ):
        """
        Record a user interaction for real-time model updates.
        
        Args:
            user_id: User performing the action
            target_id: Target user
            action: Type of action (view, like, message, etc.)
            db: Database session
        """
        # Convert action to rating
        rating = self._action_to_rating(action)
        
        if rating > 0:
            # Update collaborative filter in real-time
            collaborative_filter.update_user_interaction(user_id, target_id, rating)
    
    def _action_to_rating(self, action: str) -> float:
        """Convert user action to implicit rating."""
        action_ratings = {
            "profile_view": 0.1,
            "like": 0.7,
            "accept": 1.0,
            "message": 0.8,
            "decline": 0.05,
            "block": 0.0
        }
        
        return action_ratings.get(action, 0.1)
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the collaborative filtering model."""
        return collaborative_filter.get_model_stats()

# Global behavior tracking service
behavior_tracking_service = BehaviorTrackingService() 