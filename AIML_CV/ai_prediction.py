"""
Real AI Prediction Layer
Uses MediaPipe hand landmarks + trained Random Forest model.
"""

import os
import numpy as np
import joblib

from dataclasses import dataclass
from typing import List


@dataclass
class PredictionResult:
    predicted_sign: str
    confidence: float  # 0-100


# Load trained model
MODEL_PATH = os.path.join(
    "app",
    "ml",
    "models",
    "sign_model.pkl"
)

model = joblib.load(MODEL_PATH)


def _validate_landmarks(landmarks: List[List[float]]) -> None:
    if not landmarks or len(landmarks) != 21:
        raise ValueError(
            f"Expected 21 landmarks, got {len(landmarks) if landmarks else 0}"
        )


def predict(landmarks: List[List[float]]) -> PredictionResult:
    """
    Predict sign using trained Random Forest model.

    Input:
        21 MediaPipe landmarks [[x,y,z],...]

    Output:
        PredictionResult(sign, confidence)
    """

    _validate_landmarks(landmarks)

    # Convert landmarks into model input format
    features = []

    for point in landmarks:
        features.extend(point[:3])   # x,y,z

    features = np.array(features).reshape(1, -1)

    # Prediction
    prediction = model.predict(features)[0]

    # Confidence
    probabilities = model.predict_proba(features)[0]
    confidence = max(probabilities) * 100

    return PredictionResult(
        predicted_sign=prediction,
        confidence=round(confidence, 2)
    )