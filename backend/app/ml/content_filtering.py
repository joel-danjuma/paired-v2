import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
from typing import Dict, List, Tuple, Any, Optional
import re
from datetime import datetime

class ContentBasedFiltering:
    """Content-based filtering for user and listing recommendations."""
    
    def __init__(self):
        self.user_profiles = {}
        self.listing_profiles = {}
        self.user_feature_matrix = None
        self.listing_feature_matrix = None
        self.user_similarity_matrix = None
        self.listing_similarity_matrix = None
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=100,
            stop_words='english',
            ngram_range=(1, 2)
        )
        self.scaler = StandardScaler()
        self.is_fitted = False
    
    def fit_user_profiles(self, users: List[Dict[str, Any]]):
        """
        Fit content-based filtering on user profiles.
        
        Args:
            users: List of user dictionaries with profile information
        """
        if not users:
            return
        
        self.user_profiles = {user['id']: user for user in users}
        
        # Extract features for each user
        user_features = []
        user_text_features = []
        
        for user in users:
            # Numerical features
            features = self._extract_user_numerical_features(user)
            user_features.append(features)
            
            # Text features
            text_content = self._extract_user_text_content(user)
            user_text_features.append(text_content)
        
        # Convert to matrices
        numerical_matrix = np.array(user_features)
        
        # Scale numerical features
        if len(numerical_matrix) > 0:
            numerical_matrix = self.scaler.fit_transform(numerical_matrix)
        
        # Process text features
        text_matrix = self.tfidf_vectorizer.fit_transform(user_text_features).toarray()
        
        # Combine numerical and text features
        if numerical_matrix.size > 0 and text_matrix.size > 0:
            self.user_feature_matrix = np.hstack([numerical_matrix, text_matrix])
        elif text_matrix.size > 0:
            self.user_feature_matrix = text_matrix
        else:
            self.user_feature_matrix = numerical_matrix
        
        # Calculate similarity matrix
        if self.user_feature_matrix.size > 0:
            self.user_similarity_matrix = cosine_similarity(self.user_feature_matrix)
        
        self.is_fitted = True
    
    def fit_listing_profiles(self, listings: List[Dict[str, Any]]):
        """
        Fit content-based filtering on listing profiles.
        
        Args:
            listings: List of listing dictionaries
        """
        if not listings:
            return
        
        self.listing_profiles = {listing['id']: listing for listing in listings}
        
        # Extract features for each listing
        listing_features = []
        listing_text_features = []
        
        for listing in listings:
            # Numerical features
            features = self._extract_listing_numerical_features(listing)
            listing_features.append(features)
            
            # Text features
            text_content = self._extract_listing_text_content(listing)
            listing_text_features.append(text_content)
        
        # Convert to matrices
        numerical_matrix = np.array(listing_features)
        
        # Scale numerical features
        if len(numerical_matrix) > 0:
            numerical_matrix = self.scaler.fit_transform(numerical_matrix)
        
        # Process text features with separate vectorizer for listings
        listing_tfidf = TfidfVectorizer(
            max_features=50,
            stop_words='english',
            ngram_range=(1, 2)
        )
        text_matrix = listing_tfidf.fit_transform(listing_text_features).toarray()
        
        # Combine features
        if numerical_matrix.size > 0 and text_matrix.size > 0:
            self.listing_feature_matrix = np.hstack([numerical_matrix, text_matrix])
        elif text_matrix.size > 0:
            self.listing_feature_matrix = text_matrix
        else:
            self.listing_feature_matrix = numerical_matrix
        
        # Calculate similarity matrix
        if self.listing_feature_matrix.size > 0:
            self.listing_similarity_matrix = cosine_similarity(self.listing_feature_matrix)
    
    def _extract_user_numerical_features(self, user: Dict[str, Any]) -> List[float]:
        """Extract numerical features from user profile."""
        features = []
        
        # Age
        age = self._calculate_age(user.get('date_of_birth'))
        features.append(age if age else 25)
        
        # User type encoding
        user_type_mapping = {'seeker': 0, 'provider': 1, 'agent': 2}
        features.append(user_type_mapping.get(user.get('user_type', 'seeker'), 0))
        
        # Verification features
        features.append(float(user.get('is_verified_email', False)))
        features.append(float(user.get('is_verified_phone', False)))
        features.append(float(user.get('is_verified_identity', False)))
        features.append(float(user.get('is_background_checked', False)))
        
        # Profile completion
        features.append(user.get('profile_completion_score', 0) / 100.0)
        
        # Preferences
        preferences = user.get('preferences', {})
        features.append(preferences.get('budget', 1000) / 3000.0)  # Normalized budget
        features.append(preferences.get('location_importance', 0.5))
        features.append(preferences.get('cleanliness_importance', 3) / 5.0)
        features.append(preferences.get('social_level', 3) / 5.0)
        
        # Lifestyle
        lifestyle = user.get('lifestyle_data', {})
        features.append(lifestyle.get('cleanliness', 3) / 5.0)
        features.append(float(lifestyle.get('has_pets', False)))
        features.append(float(lifestyle.get('allows_pets', True)))
        features.append(float(lifestyle.get('is_smoker', False)))
        features.append(float(lifestyle.get('allows_smoking', False)))
        
        # Work schedule encoding
        work_schedule = lifestyle.get('work_schedule', 'flexible')
        schedule_mapping = {'9-to-5': 0, 'remote': 1, 'flexible': 2, 'night': 3}
        features.append(schedule_mapping.get(work_schedule, 2) / 3.0)
        
        return features
    
    def _extract_user_text_content(self, user: Dict[str, Any]) -> str:
        """Extract text content from user profile for TF-IDF analysis."""
        text_parts = []
        
        # Bio/description
        if user.get('bio'):
            text_parts.append(user['bio'])
        
        # Interests
        interests = user.get('interests', [])
        if interests:
            text_parts.extend(interests)
        
        # Lifestyle text data
        lifestyle = user.get('lifestyle_data', {})
        social_habits = lifestyle.get('social_habits', [])
        if social_habits:
            text_parts.extend(social_habits)
        
        # Work schedule
        work_schedule = lifestyle.get('work_schedule', '')
        if work_schedule:
            text_parts.append(work_schedule)
        
        # Join and clean text
        combined_text = ' '.join(text_parts)
        return self._clean_text(combined_text)
    
    def _extract_listing_numerical_features(self, listing: Dict[str, Any]) -> List[float]:
        """Extract numerical features from listing."""
        features = []
        
        # Price
        features.append(listing.get('price', 1000) / 3000.0)  # Normalized price
        
        # Location features (if available)
        latitude = listing.get('latitude', 0)
        longitude = listing.get('longitude', 0)
        features.extend([latitude / 90.0, longitude / 180.0])  # Normalized coordinates
        
        # Property features
        features.append(listing.get('bedrooms', 1))
        features.append(listing.get('bathrooms', 1))
        features.append(float(listing.get('furnished', False)))
        features.append(float(listing.get('pets_allowed', True)))
        features.append(float(listing.get('smoking_allowed', False)))
        
        # Listing type encoding
        listing_type = listing.get('listing_type', 'room')
        type_mapping = {'room': 0, 'apartment': 1, 'house': 2}
        features.append(type_mapping.get(listing_type, 0) / 2.0)
        
        # Availability
        features.append(float(listing.get('is_available', True)))
        
        return features
    
    def _extract_listing_text_content(self, listing: Dict[str, Any]) -> str:
        """Extract text content from listing for TF-IDF analysis."""
        text_parts = []
        
        # Title
        if listing.get('title'):
            text_parts.append(listing['title'])
        
        # Description
        if listing.get('description'):
            text_parts.append(listing['description'])
        
        # Location/neighborhood
        if listing.get('neighborhood'):
            text_parts.append(listing['neighborhood'])
        
        # Amenities
        amenities = listing.get('amenities', [])
        if amenities:
            text_parts.extend(amenities)
        
        # Join and clean text
        combined_text = ' '.join(text_parts)
        return self._clean_text(combined_text)
    
    def _clean_text(self, text: str) -> str:
        """Clean and preprocess text."""
        if not text:
            return ""
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters and extra whitespace
        text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
        text = re.sub(r'\s+', ' ', text)
        
        return text.strip()
    
    def _calculate_age(self, date_of_birth: Optional[str]) -> Optional[int]:
        """Calculate age from date of birth string."""
        if not date_of_birth:
            return None
        
        try:
            if isinstance(date_of_birth, str):
                birth_date = datetime.fromisoformat(date_of_birth.replace('Z', '+00:00'))
            else:
                birth_date = date_of_birth
            
            today = datetime.now()
            return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        except:
            return None
    
    def get_similar_users(
        self, 
        user_id: str, 
        n_recommendations: int = 10,
        min_similarity: float = 0.1
    ) -> List[Tuple[str, float]]:
        """
        Get users similar to the given user based on profile content.
        
        Args:
            user_id: Target user ID
            n_recommendations: Number of recommendations
            min_similarity: Minimum similarity threshold
            
        Returns:
            List of (user_id, similarity_score) tuples
        """
        if not self.is_fitted or user_id not in self.user_profiles:
            return []
        
        user_indices = list(self.user_profiles.keys())
        if user_id not in user_indices:
            return []
        
        user_idx = user_indices.index(user_id)
        user_similarities = self.user_similarity_matrix[user_idx]
        
        # Get similar users
        similar_users = []
        for idx, similarity in enumerate(user_similarities):
            if idx != user_idx and similarity >= min_similarity:
                similar_user_id = user_indices[idx]
                similar_users.append((similar_user_id, similarity))
        
        # Sort by similarity and return top N
        similar_users.sort(key=lambda x: x[1], reverse=True)
        return similar_users[:n_recommendations]
    
    def get_similar_listings(
        self, 
        listing_id: str, 
        n_recommendations: int = 10,
        min_similarity: float = 0.1
    ) -> List[Tuple[str, float]]:
        """
        Get listings similar to the given listing.
        
        Args:
            listing_id: Target listing ID
            n_recommendations: Number of recommendations
            min_similarity: Minimum similarity threshold
            
        Returns:
            List of (listing_id, similarity_score) tuples
        """
        if listing_id not in self.listing_profiles or self.listing_similarity_matrix is None:
            return []
        
        listing_indices = list(self.listing_profiles.keys())
        listing_idx = listing_indices.index(listing_id)
        listing_similarities = self.listing_similarity_matrix[listing_idx]
        
        # Get similar listings
        similar_listings = []
        for idx, similarity in enumerate(listing_similarities):
            if idx != listing_idx and similarity >= min_similarity:
                similar_listing_id = listing_indices[idx]
                similar_listings.append((similar_listing_id, similarity))
        
        # Sort by similarity and return top N
        similar_listings.sort(key=lambda x: x[1], reverse=True)
        return similar_listings[:n_recommendations]
    
    def recommend_users_for_user(
        self, 
        user_id: str, 
        target_user_type: str = None,
        n_recommendations: int = 10
    ) -> List[Tuple[str, float, str]]:
        """
        Recommend users based on content similarity with filtering.
        
        Args:
            user_id: Target user ID
            target_user_type: Filter by user type (seeker/provider)
            n_recommendations: Number of recommendations
            
        Returns:
            List of (user_id, similarity_score, reason) tuples
        """
        similar_users = self.get_similar_users(user_id, n_recommendations * 2)
        
        recommendations = []
        for similar_user_id, similarity in similar_users:
            similar_user = self.user_profiles.get(similar_user_id)
            if not similar_user:
                continue
            
            # Filter by user type if specified
            if target_user_type and similar_user.get('user_type') != target_user_type:
                continue
            
            # Generate reason for recommendation
            reason = self._generate_similarity_reason(user_id, similar_user_id)
            
            recommendations.append((similar_user_id, similarity, reason))
            
            if len(recommendations) >= n_recommendations:
                break
        
        return recommendations
    
    def _generate_similarity_reason(self, user_id: str, similar_user_id: str) -> str:
        """Generate human-readable reason for user similarity."""
        user = self.user_profiles.get(user_id)
        similar_user = self.user_profiles.get(similar_user_id)
        
        if not user or not similar_user:
            return "Similar profile"
        
        reasons = []
        
        # Age similarity
        user_age = self._calculate_age(user.get('date_of_birth'))
        similar_age = self._calculate_age(similar_user.get('date_of_birth'))
        if user_age and similar_age and abs(user_age - similar_age) <= 3:
            reasons.append("similar age")
        
        # Budget similarity
        user_budget = user.get('preferences', {}).get('budget')
        similar_budget = similar_user.get('preferences', {}).get('budget')
        if user_budget and similar_budget:
            budget_diff = abs(user_budget - similar_budget) / max(user_budget, similar_budget)
            if budget_diff < 0.2:
                reasons.append("similar budget")
        
        # Lifestyle similarities
        user_lifestyle = user.get('lifestyle_data', {})
        similar_lifestyle = similar_user.get('lifestyle_data', {})
        
        if (user_lifestyle.get('cleanliness') and similar_lifestyle.get('cleanliness') and
            abs(user_lifestyle['cleanliness'] - similar_lifestyle['cleanliness']) <= 1):
            reasons.append("similar cleanliness standards")
        
        if user_lifestyle.get('work_schedule') == similar_lifestyle.get('work_schedule'):
            reasons.append("similar work schedule")
        
        # Verification similarity
        if (user.get('is_verified_identity') and similar_user.get('is_verified_identity')):
            reasons.append("both verified")
        
        return ", ".join(reasons) if reasons else "compatible lifestyle"
    
    def get_content_stats(self) -> Dict[str, Any]:
        """Get statistics about the content-based filtering model."""
        return {
            "users_fitted": len(self.user_profiles) if self.user_profiles else 0,
            "listings_fitted": len(self.listing_profiles) if self.listing_profiles else 0,
            "user_features": self.user_feature_matrix.shape[1] if self.user_feature_matrix is not None else 0,
            "listing_features": self.listing_feature_matrix.shape[1] if self.listing_feature_matrix is not None else 0,
            "is_fitted": self.is_fitted,
            "tfidf_vocabulary_size": len(self.tfidf_vectorizer.vocabulary_) if hasattr(self.tfidf_vectorizer, 'vocabulary_') else 0
        }

# Global content-based filtering instance
content_filter = ContentBasedFiltering() 