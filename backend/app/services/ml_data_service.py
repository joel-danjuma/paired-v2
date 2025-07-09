from typing import List, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.models.match import Match, MatchStatus
from app.models.conversation import Conversation, Message
import asyncio

class MLDataService:
    """Service for collecting and preparing ML training data."""
    
    async def collect_training_data(self, db: AsyncSession) -> List[Tuple[Dict, Dict, float]]:
        """
        Collect training data from successful and unsuccessful matches.
        
        Returns:
            List of (user1_data, user2_data, compatibility_score) tuples
        """
        training_pairs = []
        
        # Get all matches with outcomes
        result = await db.execute(
            select(Match)
            .where(Match.status.in_([MatchStatus.MUTUAL, MatchStatus.DECLINED]))
        )
        matches = result.scalars().all()
        
        for match in matches:
            # Get user data
            user1_result = await db.execute(select(User).where(User.id == match.user_id))
            user2_result = await db.execute(select(User).where(User.id == match.target_id))
            
            user1 = user1_result.scalar_one_or_none()
            user2 = user2_result.scalar_one_or_none()
            
            if not user1 or not user2:
                continue
            
            # Convert to dict format
            user1_data = self._user_to_dict(user1)
            user2_data = self._user_to_dict(user2)
            
            # Calculate compatibility score based on match outcome
            if match.status == MatchStatus.MUTUAL:
                # Get conversation data to refine score
                conversation_score = await self._calculate_conversation_score(
                    db, match.user_id, match.target_id
                )
                base_score = 0.8  # Base score for mutual match
                compatibility_score = min(1.0, base_score + conversation_score)
            else:
                # Declined matches
                compatibility_score = max(0.0, match.compatibility_score - 0.3)
            
            training_pairs.append((user1_data, user2_data, compatibility_score))
        
        return training_pairs
    
    async def _calculate_conversation_score(
        self, 
        db: AsyncSession, 
        user1_id: str, 
        user2_id: str
    ) -> float:
        """Calculate compatibility score based on conversation activity."""
        # Find conversation between users
        result = await db.execute(
            select(Conversation)
            .where(
                Conversation.participants.contains([user1_id]) &
                Conversation.participants.contains([user2_id])
            )
        )
        conversation = result.scalar_one_or_none()
        
        if not conversation:
            return 0.0
        
        # Get messages in conversation
        message_result = await db.execute(
            select(Message)
            .where(Message.conversation_id == conversation.id)
        )
        messages = message_result.scalars().all()
        
        if not messages:
            return 0.0
        
        # Calculate engagement score
        message_count = len(messages)
        unique_senders = len(set(msg.sender_id for msg in messages))
        
        # Base score from message activity
        activity_score = min(0.2, message_count * 0.02)  # Up to 0.2 for 10+ messages
        
        # Bonus for both users participating
        participation_bonus = 0.1 if unique_senders == 2 else 0.0
        
        # Bonus for sustained conversation (multiple days)
        if message_count > 5:
            first_message = min(msg.created_at for msg in messages)
            last_message = max(msg.created_at for msg in messages)
            conversation_days = (last_message - first_message).days
            
            if conversation_days > 1:
                sustained_bonus = min(0.1, conversation_days * 0.02)
            else:
                sustained_bonus = 0.0
        else:
            sustained_bonus = 0.0
        
        return activity_score + participation_bonus + sustained_bonus
    
    def _user_to_dict(self, user: User) -> Dict[str, Any]:
        """Convert User model to dictionary for feature extraction."""
        return {
            "id": str(user.id),
            "user_type": user.user_type,
            "date_of_birth": user.date_of_birth,
            "is_verified_email": user.is_verified_email,
            "is_verified_phone": user.is_verified_phone,
            "is_verified_identity": user.is_verified_identity,
            "is_background_checked": user.is_background_checked,
            "profile_completion_score": user.profile_completion_score,
            "preferences": user.preferences or {},
            "lifestyle_data": user.lifestyle_data or {},
            "created_at": user.created_at
        }
    
    async def generate_synthetic_training_data(self, count: int = 1000) -> List[Tuple[Dict, Dict, float]]:
        """
        Generate synthetic training data for initial model training.
        This is useful when there's not enough real user data.
        """
        import random
        from datetime import datetime, timedelta
        
        synthetic_pairs = []
        
        for _ in range(count):
            # Generate two synthetic users
            user1 = self._generate_synthetic_user()
            user2 = self._generate_synthetic_user()
            
            # Calculate compatibility based on feature similarity
            compatibility = self._calculate_synthetic_compatibility(user1, user2)
            
            synthetic_pairs.append((user1, user2, compatibility))
        
        return synthetic_pairs
    
    def _generate_synthetic_user(self) -> Dict[str, Any]:
        """Generate a synthetic user for training data."""
        import random
        from datetime import datetime, timedelta
        
        age = random.randint(18, 45)
        birth_date = datetime.now() - timedelta(days=age * 365)
        
        user_types = ["seeker", "provider"]
        work_schedules = ["9-to-5", "remote", "flexible", "night"]
        
        return {
            "id": f"synthetic_{random.randint(1000, 9999)}",
            "user_type": random.choice(user_types),
            "date_of_birth": birth_date,
            "is_verified_email": random.choice([True, False]),
            "is_verified_phone": random.choice([True, False]),
            "is_verified_identity": random.choice([True, False]),
            "is_background_checked": random.choice([True, False]),
            "profile_completion_score": random.randint(20, 100),
            "preferences": {
                "budget": random.randint(500, 3000),
                "location_importance": random.uniform(0.3, 1.0),
                "cleanliness_importance": random.randint(1, 5),
                "social_level": random.randint(1, 5)
            },
            "lifestyle_data": {
                "cleanliness": random.randint(1, 5),
                "social_habits": random.sample(["quiet", "social", "party-friendly"], 
                                             random.randint(1, 2)),
                "work_schedule": random.choice(work_schedules),
                "has_pets": random.choice([True, False]),
                "allows_pets": random.choice([True, False]),
                "is_smoker": random.choice([True, False]),
                "allows_smoking": random.choice([True, False])
            },
            "created_at": datetime.now() - timedelta(days=random.randint(1, 365))
        }
    
    def _calculate_synthetic_compatibility(self, user1: Dict, user2: Dict) -> float:
        """Calculate compatibility score for synthetic users."""
        score = 0.5  # Base score
        
        # Budget compatibility
        budget1 = user1["preferences"]["budget"]
        budget2 = user2["preferences"]["budget"]
        budget_diff = abs(budget1 - budget2) / max(budget1, budget2)
        budget_score = 1.0 - budget_diff
        score += budget_score * 0.2
        
        # Cleanliness compatibility
        clean1 = user1["lifestyle_data"]["cleanliness"]
        clean2 = user2["lifestyle_data"]["cleanliness"]
        clean_diff = abs(clean1 - clean2) / 4.0
        clean_score = 1.0 - clean_diff
        score += clean_score * 0.15
        
        # Social level compatibility
        social1 = user1["preferences"]["social_level"]
        social2 = user2["preferences"]["social_level"]
        social_diff = abs(social1 - social2) / 4.0
        social_score = 1.0 - social_diff
        score += social_score * 0.15
        
        # Verification bonus
        if user1["is_verified_identity"] and user2["is_verified_identity"]:
            score += 0.1
        
        # Profile completion bonus
        profile_score = (user1["profile_completion_score"] + user2["profile_completion_score"]) / 200.0
        score += profile_score * 0.1
        
        # Add some noise to make it more realistic
        import random
        noise = random.uniform(-0.1, 0.1)
        score += noise
        
        return max(0.0, min(1.0, score))

ml_data_service = MLDataService() 