import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import NMF
from typing import Dict, List, Tuple, Any, Optional
from collections import defaultdict
import asyncio

class CollaborativeFiltering:
    """Collaborative filtering for roommate matching recommendations."""
    
    def __init__(self):
        self.user_similarity_matrix = None
        self.user_item_matrix = None
        self.user_index_map = {}
        self.index_user_map = {}
        self.nmf_model = None
        self.is_fitted = False
    
    def prepare_interaction_matrix(self, interactions: List[Dict[str, Any]]) -> pd.DataFrame:
        """
        Prepare user-item interaction matrix from match data.
        
        Args:
            interactions: List of user interactions with ratings
                Format: [{"user_id": str, "target_id": str, "rating": float}, ...]
        
        Returns:
            User-item interaction matrix
        """
        # Create interaction dataframe
        df = pd.DataFrame(interactions)
        
        if df.empty:
            return pd.DataFrame()
        
        # Create user-item matrix (users as rows, target users as columns)
        interaction_matrix = df.pivot_table(
            index='user_id',
            columns='target_id', 
            values='rating',
            fill_value=0
        )
        
        return interaction_matrix
    
    def fit(self, interactions: List[Dict[str, Any]]):
        """
        Fit the collaborative filtering model.
        
        Args:
            interactions: User interaction data with ratings
        """
        self.user_item_matrix = self.prepare_interaction_matrix(interactions)
        
        if self.user_item_matrix.empty:
            raise ValueError("No interaction data available for training")
        
        # Create user index mapping
        self.user_index_map = {user: idx for idx, user in enumerate(self.user_item_matrix.index)}
        self.index_user_map = {idx: user for user, idx in self.user_index_map.items()}
        
        # Calculate user similarity matrix
        self.user_similarity_matrix = cosine_similarity(self.user_item_matrix.values)
        
        # Fit NMF model for matrix factorization
        self.nmf_model = NMF(n_components=min(10, len(self.user_index_map)), random_state=42)
        self.nmf_model.fit(self.user_item_matrix.values)
        
        self.is_fitted = True
    
    def get_user_based_recommendations(
        self, 
        user_id: str, 
        n_recommendations: int = 10,
        min_similarity: float = 0.1
    ) -> List[Tuple[str, float]]:
        """
        Get recommendations based on similar users' preferences.
        
        Args:
            user_id: Target user ID
            n_recommendations: Number of recommendations
            min_similarity: Minimum similarity threshold
            
        Returns:
            List of (recommended_user_id, predicted_rating) tuples
        """
        if not self.is_fitted:
            raise ValueError("Model must be fitted before making recommendations")
        
        if user_id not in self.user_index_map:
            return []  # New user, no recommendations yet
        
        user_idx = self.user_index_map[user_id]
        user_similarities = self.user_similarity_matrix[user_idx]
        
        # Get similar users
        similar_users = []
        for idx, similarity in enumerate(user_similarities):
            if idx != user_idx and similarity > min_similarity:
                similar_users.append((idx, similarity))
        
        # Sort by similarity
        similar_users.sort(key=lambda x: x[1], reverse=True)
        
        # Get recommendations based on similar users
        recommendations = defaultdict(float)
        total_similarity = defaultdict(float)
        
        user_ratings = self.user_item_matrix.iloc[user_idx]
        
        for similar_idx, similarity in similar_users[:20]:  # Top 20 similar users
            similar_user_ratings = self.user_item_matrix.iloc[similar_idx]
            
            for target_user, rating in similar_user_ratings.items():
                if rating > 0 and user_ratings[target_user] == 0:  # Not rated by target user
                    recommendations[target_user] += similarity * rating
                    total_similarity[target_user] += similarity
        
        # Normalize recommendations
        final_recommendations = []
        for target_user, weighted_sum in recommendations.items():
            if total_similarity[target_user] > 0:
                predicted_rating = weighted_sum / total_similarity[target_user]
                final_recommendations.append((target_user, predicted_rating))
        
        # Sort and return top N
        final_recommendations.sort(key=lambda x: x[1], reverse=True)
        return final_recommendations[:n_recommendations]
    
    def get_matrix_factorization_recommendations(
        self, 
        user_id: str, 
        n_recommendations: int = 10
    ) -> List[Tuple[str, float]]:
        """
        Get recommendations using matrix factorization (NMF).
        
        Args:
            user_id: Target user ID
            n_recommendations: Number of recommendations
            
        Returns:
            List of (recommended_user_id, predicted_rating) tuples
        """
        if not self.is_fitted or self.nmf_model is None:
            raise ValueError("Model must be fitted before making recommendations")
        
        if user_id not in self.user_index_map:
            return []
        
        user_idx = self.user_index_map[user_id]
        
        # Get user factors
        user_factors = self.nmf_model.transform(self.user_item_matrix.values)
        item_factors = self.nmf_model.components_
        
        # Predict ratings for all items
        predicted_ratings = user_factors[user_idx] @ item_factors
        
        # Get unrated items
        user_ratings = self.user_item_matrix.iloc[user_idx]
        recommendations = []
        
        for idx, predicted_rating in enumerate(predicted_ratings):
            target_user = self.user_item_matrix.columns[idx]
            if user_ratings.iloc[idx] == 0:  # Unrated item
                recommendations.append((target_user, predicted_rating))
        
        # Sort and return top N
        recommendations.sort(key=lambda x: x[1], reverse=True)
        return recommendations[:n_recommendations]
    
    def get_hybrid_recommendations(
        self, 
        user_id: str, 
        n_recommendations: int = 10,
        user_based_weight: float = 0.7
    ) -> List[Tuple[str, float]]:
        """
        Get hybrid recommendations combining user-based and matrix factorization.
        
        Args:
            user_id: Target user ID
            n_recommendations: Number of recommendations
            user_based_weight: Weight for user-based recommendations
            
        Returns:
            List of (recommended_user_id, score) tuples
        """
        if not self.is_fitted:
            return []
        
        # Get recommendations from both methods
        user_based_recs = self.get_user_based_recommendations(user_id, n_recommendations * 2)
        mf_recs = self.get_matrix_factorization_recommendations(user_id, n_recommendations * 2)
        
        # Combine recommendations
        combined_scores = defaultdict(float)
        
        # Add user-based scores
        for target_user, score in user_based_recs:
            combined_scores[target_user] += user_based_weight * score
        
        # Add matrix factorization scores
        mf_weight = 1.0 - user_based_weight
        for target_user, score in mf_recs:
            combined_scores[target_user] += mf_weight * score
        
        # Sort and return top N
        final_recommendations = list(combined_scores.items())
        final_recommendations.sort(key=lambda x: x[1], reverse=True)
        
        return final_recommendations[:n_recommendations]
    
    def get_item_based_recommendations(
        self, 
        user_id: str, 
        n_recommendations: int = 10
    ) -> List[Tuple[str, float]]:
        """
        Get recommendations based on item (user) similarity.
        
        Args:
            user_id: Target user ID
            n_recommendations: Number of recommendations
            
        Returns:
            List of (recommended_user_id, score) tuples
        """
        if not self.is_fitted:
            return []
        
        if user_id not in self.user_index_map:
            return []
        
        # Calculate item similarity matrix (transpose of user-item matrix)
        item_similarity = cosine_similarity(self.user_item_matrix.T.values)
        
        user_ratings = self.user_item_matrix.loc[user_id]
        recommendations = defaultdict(float)
        
        # For each item the user has rated
        for item_idx, rating in enumerate(user_ratings):
            if rating > 0:
                # Find similar items
                item_similarities = item_similarity[item_idx]
                
                for similar_item_idx, similarity in enumerate(item_similarities):
                    if similar_item_idx != item_idx and user_ratings.iloc[similar_item_idx] == 0:
                        similar_item = self.user_item_matrix.columns[similar_item_idx]
                        recommendations[similar_item] += similarity * rating
        
        # Sort and return top N
        final_recommendations = list(recommendations.items())
        final_recommendations.sort(key=lambda x: x[1], reverse=True)
        
        return final_recommendations[:n_recommendations]
    
    def update_user_interaction(self, user_id: str, target_id: str, rating: float):
        """
        Update the interaction matrix with new user feedback.
        
        Args:
            user_id: User who gave the rating
            target_id: Target user being rated
            rating: Rating value
        """
        if not self.is_fitted:
            return
        
        # Add to interaction matrix if users exist
        if user_id in self.user_item_matrix.index and target_id in self.user_item_matrix.columns:
            self.user_item_matrix.loc[user_id, target_id] = rating
            
            # Recalculate user similarity for the updated user
            user_idx = self.user_index_map[user_id]
            user_similarities = cosine_similarity(
                self.user_item_matrix.iloc[[user_idx]].values,
                self.user_item_matrix.values
            )[0]
            self.user_similarity_matrix[user_idx] = user_similarities
            self.user_similarity_matrix[:, user_idx] = user_similarities
    
    def get_model_stats(self) -> Dict[str, Any]:
        """Get statistics about the collaborative filtering model."""
        if not self.is_fitted:
            return {"status": "not_fitted"}
        
        return {
            "status": "fitted",
            "n_users": len(self.user_index_map),
            "n_items": self.user_item_matrix.shape[1],
            "sparsity": 1.0 - (self.user_item_matrix.values > 0).sum() / self.user_item_matrix.size,
            "avg_ratings_per_user": (self.user_item_matrix.values > 0).sum(axis=1).mean(),
            "nmf_components": self.nmf_model.n_components if self.nmf_model else 0
        }

# Global collaborative filtering instance
collaborative_filter = CollaborativeFiltering() 