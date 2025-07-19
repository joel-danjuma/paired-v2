from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.models.listing import Listing
from app.ml.content_filtering import content_filter

class ContentRecommendationService:
    """Service for content-based recommendations."""
    
    def __init__(self):
        self.last_update = None
    
    async def update_user_profiles(self, db: AsyncSession):
        """Update user profiles in the content-based filtering system."""
        try:
            # Get all active users
            result = await db.execute(select(User).where(User.is_active == True))
            users = result.scalars().all()
            
            # Convert to dict format
            user_dicts = []
            for user in users:
                user_dict = self._user_to_dict(user)
                user_dicts.append(user_dict)
            
            # Fit content filter with user profiles
            if user_dicts:
                content_filter.fit_user_profiles(user_dicts)
                print(f"Updated content filter with {len(user_dicts)} user profiles")
                return True
            
            return False
            
        except Exception as e:
            print(f"Failed to update user profiles: {e}")
            return False
    
    async def update_listing_profiles(self, db: AsyncSession):
        """Update listing profiles in the content-based filtering system."""
        try:
            # Get all active listings
            result = await db.execute(select(Listing).where(Listing.is_available == True))
            listings = result.scalars().all()
            
            # Convert to dict format
            listing_dicts = []
            for listing in listings:
                listing_dict = self._listing_to_dict(listing)
                listing_dicts.append(listing_dict)
            
            # Fit content filter with listing profiles
            if listing_dicts:
                content_filter.fit_listing_profiles(listing_dicts)
                print(f"Updated content filter with {len(listing_dicts)} listing profiles")
                return True
            
            return False
            
        except Exception as e:
            print(f"Failed to update listing profiles: {e}")
            return False
    
    async def get_user_recommendations(
        self, 
        user_id: str, 
        target_user_type: str = None,
        n_recommendations: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get user recommendations based on content similarity.
        
        Args:
            user_id: Target user ID
            target_user_type: Filter by user type (seeker/provider)
            n_recommendations: Number of recommendations
            
        Returns:
            List of recommendation dictionaries
        """
        try:
            recommendations = content_filter.recommend_users_for_user(
                user_id, target_user_type, n_recommendations
            )
            
            # Format recommendations
            formatted_recs = []
            for user_id, similarity, reason in recommendations:
                formatted_recs.append({
                    "user_id": user_id,
                    "similarity_score": float(similarity),
                    "reason": reason,
                    "recommendation_type": "content_based"
                })
            
            return formatted_recs
            
        except Exception as e:
            print(f"Failed to get user recommendations: {e}")
            return []
    
    async def get_listing_recommendations(
        self, 
        listing_id: str, 
        n_recommendations: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get similar listings based on content.
        
        Args:
            listing_id: Target listing ID
            n_recommendations: Number of recommendations
            
        Returns:
            List of recommendation dictionaries
        """
        try:
            recommendations = content_filter.get_similar_listings(
                listing_id, n_recommendations
            )
            
            # Format recommendations
            formatted_recs = []
            for listing_id, similarity in recommendations:
                formatted_recs.append({
                    "listing_id": listing_id,
                    "similarity_score": float(similarity),
                    "recommendation_type": "content_based_listing"
                })
            
            return formatted_recs
            
        except Exception as e:
            print(f"Failed to get listing recommendations: {e}")
            return []
    
    async def get_hybrid_user_recommendations(
        self, 
        user_id: str, 
        target_user_type: str = None,
        n_recommendations: int = 10,
        content_weight: float = 0.4
    ) -> List[Dict[str, Any]]:
        """
        Get hybrid recommendations combining content-based and other methods.
        
        Args:
            user_id: Target user ID
            target_user_type: Filter by user type
            n_recommendations: Number of recommendations
            content_weight: Weight for content-based recommendations
            
        Returns:
            List of recommendation dictionaries
        """
        content_recs = await self.get_user_recommendations(
            user_id, target_user_type, n_recommendations * 2
        )
        
        # In a full implementation, we would combine with other recommendation methods
        # For now, we'll return content-based recommendations with adjusted weights
        
        for rec in content_recs:
            # Adjust score based on content weight
            rec["final_score"] = rec["similarity_score"] * content_weight
            rec["recommendation_type"] = "hybrid_content"
        
        # Sort by final score and return top N
        content_recs.sort(key=lambda x: x["final_score"], reverse=True)
        return content_recs[:n_recommendations]
    
    def _user_to_dict(self, user: User) -> Dict[str, Any]:
        """Convert User model to dictionary for content filtering."""
        return {
            "id": str(user.id),
            "user_type": user.user_type,
            "date_of_birth": user.date_of_birth.isoformat() if user.date_of_birth else None,
            "is_verified_email": user.is_verified_email,
            "is_verified_phone": user.is_verified_phone,
            "is_verified_identity": user.is_verified_identity,
            "is_background_checked": user.is_background_checked,
            "profile_completion_score": user.profile_completion_score,
            "preferences": user.preferences or {},
            "lifestyle_data": user.lifestyle_data or {},
            "bio": getattr(user, 'bio', ''),
            "interests": getattr(user, 'interests', [])
        }
    
    def _listing_to_dict(self, listing: Listing) -> Dict[str, Any]:
        """Convert Listing model to dictionary for content filtering."""
        return {
            "id": str(listing.id),
            "title": listing.title,
            "description": listing.description,
            "price": listing.price,
            "listing_type": listing.listing_type,
            "bedrooms": getattr(listing, 'bedrooms', 1),
            "bathrooms": getattr(listing, 'bathrooms', 1),
            "furnished": getattr(listing, 'furnished', False),
            "pets_allowed": getattr(listing, 'pets_allowed', True),
            "smoking_allowed": getattr(listing, 'smoking_allowed', False),
            "is_available": listing.is_available,
            "latitude": float(listing.location.y) if listing.location else 0,
            "longitude": float(listing.location.x) if listing.location else 0,
            "neighborhood": getattr(listing, 'neighborhood', ''),
            "amenities": getattr(listing, 'amenities', [])
        }
    
    def get_model_stats(self) -> Dict[str, Any]:
        """Get statistics about the content-based filtering system."""
        return content_filter.get_content_stats()
    
    async def find_users_by_interests(
        self, 
        interests: List[str], 
        db: AsyncSession,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Find users with similar interests using content analysis.
        
        Args:
            interests: List of interest keywords
            db: Database session
            limit: Maximum number of results
            
        Returns:
            List of user recommendations
        """
        try:
            # Create a pseudo-user profile with just interests
            query_profile = {
                "id": "query_user",
                "user_type": "seeker",
                "date_of_birth": None,
                "is_verified_email": False,
                "is_verified_phone": False,
                "is_verified_identity": False,
                "is_background_checked": False,
                "profile_completion_score": 50,
                "preferences": {},
                "lifestyle_data": {},
                "bio": "",
                "interests": interests
            }
            
            # Get current user profiles and add query profile
            current_profiles = list(content_filter.user_profiles.values()) if content_filter.user_profiles else []
            
            if not current_profiles:
                return []
            
            # Temporarily add query profile and refit
            all_profiles = current_profiles + [query_profile]
            content_filter.fit_user_profiles(all_profiles)
            
            # Get similar users
            similar_users = content_filter.get_similar_users("query_user", limit * 2, min_similarity=0.1)
            
            # Format results
            recommendations = []
            for user_id, similarity in similar_users:
                if user_id != "query_user":
                    recommendations.append({
                        "user_id": user_id,
                        "similarity_score": float(similarity),
                        "reason": f"Shared interests: {', '.join(interests[:3])}",
                        "recommendation_type": "interest_based"
                    })
            
            # Restore original profiles
            content_filter.fit_user_profiles(current_profiles)
            
            return recommendations[:limit]
            
        except Exception as e:
            print(f"Failed to find users by interests: {e}")
            return []

# Global content recommendation service
content_recommendation_service = ContentRecommendationService() 