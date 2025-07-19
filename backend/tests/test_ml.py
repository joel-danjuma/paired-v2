import pytest
from app.ml.feature_engineering import feature_engineer
from app.ml.models import CompatibilityModel
import numpy as np
from datetime import datetime

@pytest.fixture
def sample_user_data():
    return {
        'date_of_birth': datetime(1995, 5, 10),
        'user_type': 'seeker',
        'is_verified_email': True,
        'is_verified_phone': True,
        'is_verified_identity': False,
        'is_background_checked': False,
        'profile_completion_score': 75,
        'preferences': {
            'budget': 1200,
            'location_importance': 0.8,
            'cleanliness_importance': 4,
            'social_level': 3
        },
        'lifestyle_data': {
            'cleanliness': 4,
            'social_habits': ['social'],
            'work_schedule': '9-to-5',
            'has_pets': False,
            'allows_pets': True,
            'is_smoker': False,
            'allows_smoking': False
        }
    }

def test_extract_user_features(sample_user_data):
    features = feature_engineer.extract_user_features(sample_user_data)
    assert isinstance(features, np.ndarray)
    # Expected number of user features (adjust if changed)
    assert len(features) == 19

def test_feature_names():
    names = feature_engineer.get_feature_names()
    assert isinstance(names, list)
    assert len(names) > 0

def test_compatibility_model_training():
    model = CompatibilityModel()
    user_pairs = [
        (
            {'date_of_birth': datetime(1990, 1, 1), 'preferences': {}, 'lifestyle_data': {}},
            {'date_of_birth': datetime(1992, 1, 1), 'preferences': {}, 'lifestyle_data': {}},
            0.8
        ),
        (
            {'date_of_birth': datetime(1985, 1, 1), 'preferences': {}, 'lifestyle_data': {}},
            {'date_of_birth': datetime(2000, 1, 1), 'preferences': {}, 'lifestyle_data': {}},
            0.3
        )
    ]
    metrics = model.train(user_pairs)
    assert model.is_trained
    assert 'train_rmse' in metrics
    assert 'val_rmse' in metrics
    assert metrics['train_r2'] > 0 # Should be better than random

def test_model_prediction(sample_user_data):
    model = CompatibilityModel()
    
    # Dummy training
    user_pairs = [
        (sample_user_data, {**sample_user_data, 'preferences': {'budget': 1300}}, 0.9),
        (sample_user_data, {**sample_user_data, 'preferences': {'budget': 2500}}, 0.4)
    ]
    model.train(user_pairs)

    prediction = model.predict_compatibility(sample_user_data, sample_user_data)
    assert 0 <= prediction <= 1 