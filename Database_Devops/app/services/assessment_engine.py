"""
Assessment Engine (PDF Step 7 - "The Digital Examiner of the Platform").

Compares the AI's predicted sign against the lesson's expected sign and
computes a weighted, multi-parameter accuracy score - not just
correct/incorrect, matching the PDF's exam-checking analogy.
"""

import random
from dataclasses import dataclass

from app.services.ai_prediction import PredictionResult

# Weights sum to 1.0 - tune as the real CV/AI pipeline matures.
WEIGHTS = {
    "hand_shape": 0.30,
    "finger_position": 0.25,
    "motion": 0.15,
    "timing": 0.15,
    "position": 0.15,
}

PASS_THRESHOLD = 70.0  # overall_accuracy >= this -> passed


@dataclass
class AssessmentScores:
    hand_shape_score: float
    finger_position_score: float
    motion_score: float
    timing_score: float
    position_score: float
    overall_accuracy: float
    passed: bool


def _score_from_confidence(confidence: float, jitter: float = 6.0) -> float:
    """
    Derives a sub-parameter score from the model's confidence, with a
    small deterministic-ish jitter so the 5 parameters aren't identical
    (mirrors PDF's example table where scores vary per parameter: hand
    shape 95%, finger position 90%, timing 85%, etc.)
    Clamped to [0, 100].
    """
    value = confidence + random.uniform(-jitter, jitter)
    return round(max(0.0, min(100.0, value)), 1)


def evaluate(
    prediction: PredictionResult,
    expected_sign: str,
    hold_duration_seconds: float,
    expected_hold_seconds: float = 2.0,
) -> AssessmentScores:
    """
    Core scoring logic. `prediction.confidence` drives hand-shape/finger
    scores (since those are what the classifier is most directly judging);
    `hold_duration_seconds` vs `expected_hold_seconds` drives timing.
    """
    sign_matched = prediction.predicted_sign.strip().upper() == expected_sign.strip().upper()

    # If the wrong sign was predicted, cap scores hard regardless of confidence.
    base = prediction.confidence if sign_matched else min(prediction.confidence, 40.0)

    hand_shape_score = _score_from_confidence(base)
    finger_position_score = _score_from_confidence(base, jitter=8.0)
    motion_score = _score_from_confidence(base, jitter=10.0)
    position_score = _score_from_confidence(base, jitter=8.0)

    timing_ratio = min(hold_duration_seconds / expected_hold_seconds, 1.5) if expected_hold_seconds else 1.0
    # 1.0 ratio -> 100; too short or too long both reduce score
    timing_score = round(max(0.0, 100 - abs(1.0 - timing_ratio) * 100), 1)

    overall_accuracy = round(
        hand_shape_score * WEIGHTS["hand_shape"]
        + finger_position_score * WEIGHTS["finger_position"]
        + motion_score * WEIGHTS["motion"]
        + timing_score * WEIGHTS["timing"]
        + position_score * WEIGHTS["position"],
        1,
    )

    return AssessmentScores(
        hand_shape_score=hand_shape_score,
        finger_position_score=finger_position_score,
        motion_score=motion_score,
        timing_score=timing_score,
        position_score=position_score,
        overall_accuracy=overall_accuracy,
        passed=overall_accuracy >= PASS_THRESHOLD and sign_matched,
    )
