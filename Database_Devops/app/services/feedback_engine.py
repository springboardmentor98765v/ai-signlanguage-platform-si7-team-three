"""
Feedback and Learning Intelligence Engine (PDF Step 8 -
"The Personal Tutor of the Learner").

Turns raw parameter scores into human-readable mistakes + suggestions,
instead of a flat "Wrong Gesture" message.
"""

from typing import List, Tuple

from app.services.assessment_engine import AssessmentScores

# (score attribute, threshold below which it's a "mistake", mistake text, suggestion text)
_RULES: List[Tuple[str, float, str, str]] = [
    ("hand_shape_score", 75.0, "The overall hand shape did not match the expected sign.",
     "Study the reference image again and mirror the exact hand posture."),
    ("finger_position_score", 75.0, "One or more fingers were not positioned correctly.",
     "Extend or curl each finger fully - avoid a half-bent position."),
    ("motion_score", 75.0, "The movement pattern was off for this gesture.",
     "Slow down the motion and follow the demonstrated path closely."),
    ("timing_score", 75.0, "The gesture was not held for the correct duration.",
     "Hold the final hand position for about 2 seconds before releasing."),
    ("position_score", 75.0, "The hand was not positioned correctly in the frame.",
     "Keep your hand centered and at chest height in front of the camera."),
]


def generate_feedback(scores: AssessmentScores) -> Tuple[List[str], List[str]]:
    """Returns (mistakes, suggestions) lists based on which parameters fell below threshold."""
    mistakes: List[str] = []
    suggestions: List[str] = []

    for attr, threshold, mistake_text, suggestion_text in _RULES:
        if getattr(scores, attr) < threshold:
            mistakes.append(mistake_text)
            suggestions.append(suggestion_text)

    if not mistakes:
        mistakes.append("No significant mistakes detected.")
        suggestions.append("Great job - move on to the next lesson!")

    return mistakes, suggestions
