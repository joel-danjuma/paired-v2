from typing import List, Dict, Any
from app.models.user import User
from app.models.listing import Listing
from app.ml.models import model_manager

class MatchingService:
    def __init__(self):
        self.use_ml = False  # Flag to enable/disable ML
        
    def enable_ml_matching(self):
        """Enable ML-based matching."""
        self.use_ml = True
        
    def disable_ml_matching(self):
        """Disable ML-based matching (fallback to rule-based)."""
        self.use_ml = False
    
    def calculate_compatibility(self, user1: User, user2: User) -> float:
        """
        Calculate compatibility score between two users.
        Uses ML model if available, otherwise falls back to rule-based approach.
        """
        if self.use_ml and model_manager.active_model:
            return self._ml_compatibility(user1, user2)
        else:
            return self._rule_based_compatibility(user1, user2)
    
    def _ml_compatibility(self, user1: User, user2: User) -> float:
        """Calculate compatibility using ML model."""
        try:
            # Convert users to feature format
            user1_data = self._user_to_feature_dict(user1)
            user2_data = self._user_to_feature_dict(user2)
            
            # Get ML prediction
            ml_score = model_manager.predict_compatibility(user1_data, user2_data)
            
            # Combine with rule-based score for robustness
            rule_score = self._rule_based_compatibility(user1, user2)
            
            # Weighted combination (70% ML, 30% rules)
            final_score = 0.7 * ml_score + 0.3 * rule_score
            
            return max(0.0, min(1.0, final_score))
            
        except Exception as e:
            print(f"ML prediction failed, falling back to rules: {e}")
            return self._rule_based_compatibility(user1, user2)
    
    def _rule_based_compatibility(self, user1: User, user2: User) -> float:
        """Original rule-based compatibility calculation."""
        score = 0.0
        total_weight = 0
        
        # Example preference matching (to be expanded)
        preferences1 = user1.preferences or {}
        preferences2 = user2.preferences or {}
        
        # Budget alignment (example weight: 30)
        budget1 = preferences1.get("budget")
        budget2 = preferences2.get("budget")
        if budget1 and budget2:
            budget_diff = abs(budget1 - budget2)
            budget_score = max(0, 1 - (budget_diff / 1000))  # Normalize
            score += budget_score * 30
            total_weight += 30
            
        # Lifestyle habits (example weight: 20)
        lifestyle1 = user1.lifestyle_data or {}
        lifestyle2 = user2.lifestyle_data or {}
        
        cleanliness1 = lifestyle1.get("cleanliness")
        cleanliness2 = lifestyle2.get("cleanliness")
        if cleanliness1 and cleanliness2:
            # Assuming cleanliness is on a scale of 1-5
            cleanliness_diff = abs(cleanliness1 - cleanliness2)
            cleanliness_score = max(0, 1 - (cleanliness_diff / 4))
            score += cleanliness_score * 20
            total_weight += 20
        
        # Verification bonus (weight: 15)
        verification_score = 0
        if user1.is_verified_identity: verification_score += 0.5
        if user2.is_verified_identity: verification_score += 0.5
        if user1.is_background_checked: verification_score += 0.25
        if user2.is_background_checked: verification_score += 0.25
        
        score += verification_score * 15
        total_weight += 15
        
        # Profile completion bonus (weight: 10)
        profile_score = (user1.profile_completion_score + user2.profile_completion_score) / 200.0
        score += profile_score * 10
        total_weight += 10
        
        # Normalize final score to be between 0 and 1
        if total_weight > 0:
            return score / total_weight
        
        return 0.0

    def find_matches_for_user(
        self, 
        user: User, 
        potential_matches: List[User],
        use_advanced_filtering: bool = True
    ) -> List[Dict[str, Any]]:
        """Find and score matches for a given user with enhanced filtering."""
        matches = []
        
        for potential_match in potential_matches:
            if user.id == potential_match.id:
                continue
            
            # Advanced pre-filtering
            if use_advanced_filtering and not self._passes_advanced_filters(user, potential_match):
                continue
            
            score = self.calculate_compatibility(user, potential_match)
            
            # Dynamic threshold based on user verification and profile completion
            threshold = self._calculate_dynamic_threshold(user, potential_match)
            
            if score > threshold:
                matches.append({
                    "user": potential_match,
                    "compatibility_score": score,
                    "match_reasons": self._generate_match_reasons(user, potential_match, score)
                })
        
        # Sort matches by score and apply diversity filtering
        matches.sort(key=lambda x: x["compatibility_score"], reverse=True)
        
        # Apply diversity filtering to avoid too similar matches
        if len(matches) > 10:
            matches = self._apply_diversity_filtering(matches)
        
        return matches
    
    def _passes_advanced_filters(self, user1: User, user2: User) -> bool:
        """Apply advanced filtering before compatibility calculation."""
        preferences1 = user1.preferences or {}
        preferences2 = user2.preferences or {}
        lifestyle1 = user1.lifestyle_data or {}
        lifestyle2 = user2.lifestyle_data or {}
        
        # Hard budget constraints
        budget1 = preferences1.get("budget")
        budget2 = preferences2.get("budget")
        if budget1 and budget2:
            budget_diff_ratio = abs(budget1 - budget2) / max(budget1, budget2)
            if budget_diff_ratio > 0.5:  # More than 50% difference
                return False
        
        # Deal breakers
        smoking1 = lifestyle1.get("is_smoker", False)
        smoking2 = lifestyle2.get("allows_smoking", True)
        if smoking1 and not smoking2:
            return False
        
        pets1 = lifestyle1.get("has_pets", False)
        pets2 = lifestyle2.get("allows_pets", True)
        if pets1 and not pets2:
            return False
        
        return True
    
    def _calculate_dynamic_threshold(self, user1: User, user2: User) -> float:
        """Calculate dynamic threshold based on user profiles."""
        base_threshold = 0.5
        
        # Lower threshold for highly verified users
        verification_bonus = 0
        if user1.is_verified_identity and user2.is_verified_identity:
            verification_bonus += 0.1
        if user1.is_background_checked and user2.is_background_checked:
            verification_bonus += 0.1
        
        # Lower threshold for complete profiles
        profile_bonus = 0
        avg_completion = (user1.profile_completion_score + user2.profile_completion_score) / 2
        if avg_completion > 80:
            profile_bonus = 0.1
        elif avg_completion > 60:
            profile_bonus = 0.05
        
        return max(0.3, base_threshold - verification_bonus - profile_bonus)
    
    def _generate_match_reasons(self, user1: User, user2: User, score: float) -> List[str]:
        """Generate human-readable reasons for the match."""
        reasons = []
        
        preferences1 = user1.preferences or {}
        preferences2 = user2.preferences or {}
        lifestyle1 = user1.lifestyle_data or {}
        lifestyle2 = user2.lifestyle_data or {}
        
        # Budget compatibility
        budget1 = preferences1.get("budget")
        budget2 = preferences2.get("budget")
        if budget1 and budget2 and abs(budget1 - budget2) / max(budget1, budget2) < 0.2:
            reasons.append("Similar budget preferences")
        
        # Cleanliness compatibility
        clean1 = lifestyle1.get("cleanliness")
        clean2 = lifestyle2.get("cleanliness")
        if clean1 and clean2 and abs(clean1 - clean2) <= 1:
            if clean1 >= 4 and clean2 >= 4:
                reasons.append("Both value cleanliness")
            else:
                reasons.append("Compatible cleanliness standards")
        
        # Verification status
        if user1.is_verified_identity and user2.is_verified_identity:
            reasons.append("Both identity verified")
        
        if user1.is_background_checked and user2.is_background_checked:
            reasons.append("Both background checked")
        
        # Social compatibility
        social1 = preferences1.get("social_level")
        social2 = preferences2.get("social_level")
        if social1 and social2 and abs(social1 - social2) <= 1:
            if social1 <= 2 and social2 <= 2:
                reasons.append("Both prefer quiet lifestyle")
            elif social1 >= 4 and social2 >= 4:
                reasons.append("Both enjoy social activities")
            else:
                reasons.append("Compatible social preferences")
        
        # High compatibility score
        if score > 0.8:
            reasons.append("Excellent overall compatibility")
        elif score > 0.7:
            reasons.append("Strong compatibility match")
        
        return reasons[:3]  # Limit to top 3 reasons
    
    def _apply_diversity_filtering(self, matches: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Apply diversity filtering to avoid too similar matches."""
        if len(matches) <= 10:
            return matches
        
        # Keep top 5 matches regardless
        diverse_matches = matches[:5]
        remaining_matches = matches[5:]
        
        # Add diverse matches from remaining
        for match in remaining_matches:
            if len(diverse_matches) >= 15:
                break
                
            user = match["user"]
            
            # Check if this user adds diversity
            is_diverse = True
            for existing_match in diverse_matches[-5:]:  # Check against recent additions
                existing_user = existing_match["user"]
                
                # Compare key attributes for diversity
                if (user.user_type == existing_user.user_type and
                    self._similar_lifestyle(user, existing_user)):
                    is_diverse = False
                    break
            
            if is_diverse:
                diverse_matches.append(match)
        
        return diverse_matches
    
    def _similar_lifestyle(self, user1: User, user2: User) -> bool:
        """Check if two users have very similar lifestyles."""
        lifestyle1 = user1.lifestyle_data or {}
        lifestyle2 = user2.lifestyle_data or {}
        
        # Check cleanliness similarity
        clean1 = lifestyle1.get("cleanliness", 3)
        clean2 = lifestyle2.get("cleanliness", 3)
        
        # Check work schedule similarity
        schedule1 = lifestyle1.get("work_schedule", "flexible")
        schedule2 = lifestyle2.get("work_schedule", "flexible")
        
        return (abs(clean1 - clean2) <= 1 and schedule1 == schedule2)
    
    def _user_to_feature_dict(self, user: User) -> Dict[str, Any]:
        """Convert User model to feature dictionary for ML."""
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

matching_service = MatchingService() 