"""
AI/ML Prediction Layer (PDF Step 6 - "The Teacher That Understands the Sign").

Takes 21 hand landmarks (already extracted by MediaPipe on the client,
or by services/hand_tracking.py on the server) and predicts which sign
is being performed, with a confidence score.

NOTE FOR THE AI/ML TEAMMATE:
This module currently ships a lightweight geometric-heuristic classifier
so the rest of the pipeline (Assessment -> Feedback -> Analytics) is
fully testable without a trained model or GPU. Replace `predict()`
internals with a real scikit-learn / CNN model loaded from disk -
the function signature and return contract below MUST stay the same
so nothing downstream breaks:

    predict(landmarks: List[List[float]]) -> PredictionResult
"""

import math
from dataclasses import dataclass
from typing import List


@dataclass
class PredictionResult:
    predicted_sign: str
    confidence: float  # 0-100


# MediaPipe hand landmark indices we care about for the heuristic model
WRIST = 0
THUMB_TIP = 4
INDEX_TIP = 8
MIDDLE_MCP = 9   # base knuckle of the middle finger - stable regardless of finger curl
MIDDLE_TIP = 12
RING_TIP = 16
PINKY_TIP = 20

# A tiny reference "alphabet" used by the heuristic/demo classifier.
# A real model replaces this entirely.
SUPPORTED_SIGNS = ["A", "B", "C", "M", "N", "R"]


def _distance(p1: List[float], p2: List[float]) -> float:
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(p1, p2)))


def _validate_landmarks(landmarks: List[List[float]]) -> None:
    if not landmarks or len(landmarks) != 21:
        raise ValueError(
            f"Expected 21 hand landmarks (MediaPipe Hands output), got {len(landmarks) if landmarks else 0}."
        )
    for point in landmarks:
        if len(point) < 2:
            raise ValueError("Each landmark must have at least [x, y] coordinates.")


def predict(landmarks: List[List[float]]) -> PredictionResult:
    """
    Demo/heuristic classifier: measures how curled each finger is
    (distance from fingertip to wrist relative to palm size) and maps
    the resulting pattern to the closest known sign.

    This keeps the contract realistic (input: 21 landmarks, output:
    predicted_sign + confidence) while remaining a pure-Python stub
    with zero heavy ML dependencies, so QA/CI can run it anywhere.
    """
    _validate_landmarks(landmarks)

    wrist = landmarks[WRIST]
    # Use the middle-finger MCP (base knuckle) as the palm-size reference.
    # This point stays roughly fixed whether fingers are curled or extended,
    # unlike the fingertip itself, so it works as a stable measuring stick.
    palm_size = _distance(wrist, landmarks[MIDDLE_MCP]) or 1e-6

    finger_tips = [THUMB_TIP, INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP]
    extension_ratios = [_distance(wrist, landmarks[tip]) / palm_size for tip in finger_tips]

    # crude fingers-extended count using a threshold on normalized distance
    extended = [1 if r > 0.55 else 0 for r in extension_ratios]
    num_extended = sum(extended)

    # Toy rule table roughly matching the PDF's example:
    #   Closed fist + thumb outside -> A
    #   Flat palm                   -> B
    #   Curved fingers               -> C
    if num_extended == 0:
        predicted_sign, base_confidence = "A", 0.90
    elif num_extended == 5:
        predicted_sign, base_confidence = "B", 0.88
    elif num_extended in (2, 3):
        predicted_sign, base_confidence = "C", 0.75
    else:
        predicted_sign, base_confidence = "M", 0.60

    # confidence nudged by how decisively fingers were classified
    spread = max(extension_ratios) - min(extension_ratios)
    confidence = min(99.0, round((base_confidence + min(spread, 0.3)) * 100, 1))

    return PredictionResult(predicted_sign=predicted_sign, confidence=confidence)
