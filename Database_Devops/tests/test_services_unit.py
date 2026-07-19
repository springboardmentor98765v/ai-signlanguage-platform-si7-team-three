"""
Unit tests for the service layer, isolated from HTTP/DB (PDF Steps 6, 7, 8).

These test the AI/CV pipeline "contract": given landmark input, do we
get back a correctly-shaped, sane prediction and score - regardless of
whether the underlying model is the current heuristic stub or a real
trained CNN later.
"""

import pytest

from app.services import ai_prediction, assessment_engine, feedback_engine
from tests.test_practice_pipeline import OPEN_HAND_LANDMARKS, CLOSED_FIST_LANDMARKS


class TestAIPrediction:
    def test_predict_returns_expected_shape(self):
        result = ai_prediction.predict(OPEN_HAND_LANDMARKS)
        assert hasattr(result, "predicted_sign")
        assert hasattr(result, "confidence")
        assert isinstance(result.predicted_sign, str)
        assert 0 <= result.confidence <= 100

    def test_predict_open_hand_is_not_closed_fist_sign(self):
        open_result = ai_prediction.predict(OPEN_HAND_LANDMARKS)
        fist_result = ai_prediction.predict(CLOSED_FIST_LANDMARKS)
        assert open_result.predicted_sign != fist_result.predicted_sign

    def test_predict_rejects_wrong_landmark_count(self):
        with pytest.raises(ValueError):
            ai_prediction.predict([[0.1, 0.2, 0.0]] * 5)  # only 5, need 21

    def test_predict_rejects_empty_landmarks(self):
        with pytest.raises(ValueError):
            ai_prediction.predict([])

    def test_predict_rejects_malformed_points(self):
        with pytest.raises(ValueError):
            ai_prediction.predict([[0.1]] * 21)  # missing y coordinate


class TestAssessmentEngine:
    def test_matching_sign_scores_higher_than_mismatch(self):
        prediction = ai_prediction.predict(OPEN_HAND_LANDMARKS)  # predicts "B"

        matched = assessment_engine.evaluate(prediction, expected_sign="B", hold_duration_seconds=2.0)
        mismatched = assessment_engine.evaluate(prediction, expected_sign="A", hold_duration_seconds=2.0)

        assert matched.overall_accuracy > mismatched.overall_accuracy

    def test_ideal_hold_duration_maximizes_timing_score(self):
        prediction = ai_prediction.predict(OPEN_HAND_LANDMARKS)
        ideal = assessment_engine.evaluate(prediction, expected_sign="B", hold_duration_seconds=2.0)
        too_short = assessment_engine.evaluate(prediction, expected_sign="B", hold_duration_seconds=0.2)
        assert ideal.timing_score >= too_short.timing_score

    def test_all_scores_within_valid_range(self):
        prediction = ai_prediction.predict(OPEN_HAND_LANDMARKS)
        scores = assessment_engine.evaluate(prediction, expected_sign="B", hold_duration_seconds=2.0)
        for value in [
            scores.hand_shape_score, scores.finger_position_score, scores.motion_score,
            scores.timing_score, scores.position_score, scores.overall_accuracy,
        ]:
            assert 0.0 <= value <= 100.0

    def test_mismatched_sign_never_passes(self):
        prediction = ai_prediction.predict(OPEN_HAND_LANDMARKS)  # predicts "B"
        scores = assessment_engine.evaluate(prediction, expected_sign="Z", hold_duration_seconds=2.0)
        assert scores.passed is False


class TestFeedbackEngine:
    def test_low_scores_generate_matching_mistakes_and_suggestions(self):
        prediction = ai_prediction.predict(CLOSED_FIST_LANDMARKS)
        scores = assessment_engine.evaluate(prediction, expected_sign="Z", hold_duration_seconds=0.1)
        mistakes, suggestions = feedback_engine.generate_feedback(scores)
        assert len(mistakes) == len(suggestions)
        assert len(mistakes) > 0

    def test_perfect_scores_yield_encouraging_message(self):
        from app.services.assessment_engine import AssessmentScores
        perfect = AssessmentScores(
            hand_shape_score=100, finger_position_score=100, motion_score=100,
            timing_score=100, position_score=100, overall_accuracy=100, passed=True,
        )
        mistakes, suggestions = feedback_engine.generate_feedback(perfect)
        assert mistakes == ["No significant mistakes detected."]
        assert "next lesson" in suggestions[0].lower()
