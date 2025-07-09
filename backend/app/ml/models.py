import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score
from typing import Tuple, Dict, Any, List, Optional
import joblib
import os
from datetime import datetime

from app.ml.feature_engineering import feature_engineer

class CompatibilityModel:
    """Machine learning model for predicting user compatibility."""
    
    def __init__(self, model_type: str = "random_forest"):
        self.model_type = model_type
        self.model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self.feature_names = feature_engineer.get_feature_names()
        
        # Initialize model based on type
        if model_type == "random_forest":
            self.model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42,
                n_jobs=-1
            )
        elif model_type == "gradient_boosting":
            self.model = GradientBoostingRegressor(
                n_estimators=100,
                max_depth=6,
                random_state=42
            )
        else:
            raise ValueError(f"Unsupported model type: {model_type}")
    
    def prepare_training_data(self, user_pairs: List[Tuple[Dict, Dict, float]]) -> Tuple[np.ndarray, np.ndarray]:
        """
        Prepare training data from user pairs and their compatibility scores.
        
        Args:
            user_pairs: List of (user1_data, user2_data, compatibility_score) tuples
        
        Returns:
            X: Feature matrix
            y: Target compatibility scores
        """
        X = []
        y = []
        
        for user1_data, user2_data, score in user_pairs:
            # Extract features for both users
            features1 = feature_engineer.extract_user_features(user1_data)
            features2 = feature_engineer.extract_user_features(user2_data)
            
            # Combine features (difference, absolute difference, and concatenation)
            feature_diff = features1 - features2
            feature_abs_diff = np.abs(features1 - features2)
            combined_features = np.concatenate([features1, features2, feature_diff, feature_abs_diff])
            
            X.append(combined_features)
            y.append(score)
        
        return np.array(X), np.array(y)
    
    def train(self, user_pairs: List[Tuple[Dict, Dict, float]], validation_split: float = 0.2) -> Dict[str, float]:
        """
        Train the compatibility model.
        
        Args:
            user_pairs: Training data
            validation_split: Fraction of data to use for validation
        
        Returns:
            Training metrics
        """
        X, y = self.prepare_training_data(user_pairs)
        
        # Split data
        X_train, X_val, y_train, y_val = train_test_split(
            X, y, test_size=validation_split, random_state=42
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_val_scaled = self.scaler.transform(X_val)
        
        # Train model
        self.model.fit(X_train_scaled, y_train)
        self.is_trained = True
        
        # Evaluate
        train_pred = self.model.predict(X_train_scaled)
        val_pred = self.model.predict(X_val_scaled)
        
        metrics = {
            "train_rmse": np.sqrt(mean_squared_error(y_train, train_pred)),
            "val_rmse": np.sqrt(mean_squared_error(y_val, val_pred)),
            "train_r2": r2_score(y_train, train_pred),
            "val_r2": r2_score(y_val, val_pred),
            "training_samples": len(X_train),
            "validation_samples": len(X_val)
        }
        
        return metrics
    
    def predict_compatibility(self, user1_data: Dict[str, Any], user2_data: Dict[str, Any]) -> float:
        """
        Predict compatibility score between two users.
        
        Args:
            user1_data: First user's data
            user2_data: Second user's data
        
        Returns:
            Compatibility score (0-1)
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        # Extract and combine features
        features1 = feature_engineer.extract_user_features(user1_data)
        features2 = feature_engineer.extract_user_features(user2_data)
        
        feature_diff = features1 - features2
        feature_abs_diff = np.abs(features1 - features2)
        combined_features = np.concatenate([features1, features2, feature_diff, feature_abs_diff])
        
        # Scale and predict
        X = combined_features.reshape(1, -1)
        X_scaled = self.scaler.transform(X)
        
        prediction = self.model.predict(X_scaled)[0]
        
        # Ensure prediction is in valid range
        return max(0.0, min(1.0, prediction))
    
    def get_feature_importance(self) -> Dict[str, float]:
        """Get feature importance scores."""
        if not self.is_trained or not hasattr(self.model, 'feature_importances_'):
            return {}
        
        # Create extended feature names for combined features
        base_features = self.feature_names
        extended_features = (
            [f"user1_{name}" for name in base_features] +
            [f"user2_{name}" for name in base_features] +
            [f"diff_{name}" for name in base_features] +
            [f"abs_diff_{name}" for name in base_features]
        )
        
        importance_dict = dict(zip(extended_features, self.model.feature_importances_))
        
        # Sort by importance
        return dict(sorted(importance_dict.items(), key=lambda x: x[1], reverse=True))
    
    def save_model(self, filepath: str):
        """Save the trained model to disk."""
        if not self.is_trained:
            raise ValueError("Cannot save untrained model")
        
        model_data = {
            "model": self.model,
            "scaler": self.scaler,
            "model_type": self.model_type,
            "feature_names": self.feature_names,
            "trained_at": datetime.now()
        }
        
        joblib.dump(model_data, filepath)
    
    def load_model(self, filepath: str):
        """Load a trained model from disk."""
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Model file not found: {filepath}")
        
        model_data = joblib.load(filepath)
        
        self.model = model_data["model"]
        self.scaler = model_data["scaler"]
        self.model_type = model_data["model_type"]
        self.feature_names = model_data["feature_names"]
        self.is_trained = True

class ModelManager:
    """Manager for multiple ML models."""
    
    def __init__(self):
        self.models = {}
        self.active_model = None
    
    def create_model(self, name: str, model_type: str = "random_forest") -> CompatibilityModel:
        """Create a new model."""
        model = CompatibilityModel(model_type)
        self.models[name] = model
        return model
    
    def set_active_model(self, name: str):
        """Set the active model for predictions."""
        if name not in self.models:
            raise ValueError(f"Model '{name}' not found")
        self.active_model = self.models[name]
    
    def predict_compatibility(self, user1_data: Dict[str, Any], user2_data: Dict[str, Any]) -> float:
        """Predict compatibility using the active model."""
        if not self.active_model:
            raise ValueError("No active model set")
        return self.active_model.predict_compatibility(user1_data, user2_data)
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about available models."""
        return {
            "available_models": list(self.models.keys()),
            "active_model": type(self.active_model).__name__ if self.active_model else None,
            "model_types": {name: model.model_type for name, model in self.models.items()}
        }

# Global model manager instance
model_manager = ModelManager() 