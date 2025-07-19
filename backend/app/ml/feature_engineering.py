import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta

class FeatureEngineer:
    """Feature engineering for user compatibility and behavior analysis."""
    
    def __init__(self):
        self.feature_names = []
    
    def extract_user_features(self, user_data: Dict[str, Any]) -> np.ndarray:
        """Extract features from user data for ML models."""
        features = []
        
        # Basic demographic features
        age = self._calculate_age(user_data.get('date_of_birth'))
        features.append(age if age else 25)  # Default age
        
        # User type encoding
        user_type_mapping = {'seeker': 0, 'provider': 1, 'agent': 2}
        features.append(user_type_mapping.get(user_data.get('user_type', 'seeker'), 0))
        
        # Verification status features
        features.append(int(user_data.get('is_verified_email', False)))
        features.append(int(user_data.get('is_verified_phone', False)))
        features.append(int(user_data.get('is_verified_identity', False)))
        features.append(int(user_data.get('is_background_checked', False)))
        
        # Profile completion
        features.append(user_data.get('profile_completion_score', 0) / 100.0)
        
        # Preference features
        preferences = user_data.get('preferences', {})
        features.extend(self._extract_preference_features(preferences))
        
        # Lifestyle features
        lifestyle = user_data.get('lifestyle_data', {})
        features.extend(self._extract_lifestyle_features(lifestyle))
        
        return np.array(features, dtype=np.float32)
    
    def extract_interaction_features(self, interactions: List[Dict[str, Any]]) -> np.ndarray:
        """Extract features from user interaction history."""
        features = []
        
        # Interaction counts
        features.append(len(interactions))
        
        # Response rate
        responses = [i for i in interactions if i.get('user_action') == 'accepted']
        response_rate = len(responses) / len(interactions) if interactions else 0
        features.append(response_rate)
        
        # Average time to respond (in hours)
        response_times = []
        for interaction in interactions:
            if interaction.get('created_at') and interaction.get('updated_at'):
                time_diff = interaction['updated_at'] - interaction['created_at']
                response_times.append(time_diff.total_seconds() / 3600)
        
        avg_response_time = np.mean(response_times) if response_times else 24.0
        features.append(min(avg_response_time, 168.0))  # Cap at 1 week
        
        # Activity level (interactions per day)
        if interactions:
            first_interaction = min(i['created_at'] for i in interactions)
            days_active = max((datetime.now() - first_interaction).days, 1)
            activity_level = len(interactions) / days_active
        else:
            activity_level = 0
        features.append(activity_level)
        
        return np.array(features, dtype=np.float32)
    
    def _calculate_age(self, date_of_birth: Optional[datetime]) -> Optional[int]:
        """Calculate age from date of birth."""
        if not date_of_birth:
            return None
        
        today = datetime.now()
        return today.year - date_of_birth.year - ((today.month, today.day) < (date_of_birth.month, date_of_birth.day))
    
    def _extract_preference_features(self, preferences: Dict[str, Any]) -> List[float]:
        """Extract features from user preferences."""
        features = []
        
        # Budget features
        budget = preferences.get('budget', 1000)
        features.append(budget / 3000.0)  # Normalize by max expected budget
        
        # Location preference strength (0-1)
        location_pref = preferences.get('location_importance', 0.5)
        features.append(location_pref)
        
        # Cleanliness preference (1-5 scale, normalized)
        cleanliness = preferences.get('cleanliness_importance', 3)
        features.append(cleanliness / 5.0)
        
        # Social preferences
        social_pref = preferences.get('social_level', 3)  # 1=very quiet, 5=very social
        features.append(social_pref / 5.0)
        
        return features
    
    def _extract_lifestyle_features(self, lifestyle: Dict[str, Any]) -> List[float]:
        """Extract features from lifestyle data."""
        features = []
        
        # Cleanliness level (1-5)
        cleanliness = lifestyle.get('cleanliness', 3)
        features.append(cleanliness / 5.0)
        
        # Social habits
        social_habits = lifestyle.get('social_habits', [])
        is_quiet = 'quiet' in social_habits
        is_social = 'social' in social_habits
        features.extend([float(is_quiet), float(is_social)])
        
        # Work schedule (encoded)
        work_schedule = lifestyle.get('work_schedule', 'flexible')
        schedule_mapping = {'9-to-5': 0, 'remote': 1, 'flexible': 2, 'night': 3}
        features.append(schedule_mapping.get(work_schedule, 2) / 3.0)
        
        # Pet preferences
        has_pets = lifestyle.get('has_pets', False)
        allows_pets = lifestyle.get('allows_pets', True)
        features.extend([float(has_pets), float(allows_pets)])
        
        # Smoking preferences
        is_smoker = lifestyle.get('is_smoker', False)
        allows_smoking = lifestyle.get('allows_smoking', False)
        features.extend([float(is_smoker), float(allows_smoking)])
        
        return features
    
    def get_feature_names(self) -> List[str]:
        """Get the names of all features."""
        return [
            'age', 'user_type', 'verified_email', 'verified_phone', 
            'verified_identity', 'background_checked', 'profile_completion',
            'budget_normalized', 'location_importance', 'cleanliness_importance', 'social_level',
            'lifestyle_cleanliness', 'is_quiet', 'is_social', 'work_schedule',
            'has_pets', 'allows_pets', 'is_smoker', 'allows_smoking',
            'interaction_count', 'response_rate', 'avg_response_time', 'activity_level'
        ]

feature_engineer = FeatureEngineer() 