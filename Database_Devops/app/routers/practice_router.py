"""
Practice + Assessment + Feedback Router.

Implements the PDF's "Key Workflow":
  User Logs In -> Selects Lesson -> Starts Practice (Webcam) ->
  Gesture Captured & Processed -> AI Predicts Sign ->
  Assessment & Feedback -> Progress Saved & Analytics Updated ->
  Recommendations & Next Lesson

Only Learners submit gestures; Instructors/Trainers/Admins can view
sessions but the practice loop itself is learner-only, per PDF RBAC
("A learner can practice signs but cannot create courses.").
"""

import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.auth import get_current_user, require_role
from app.services import ai_prediction, assessment_engine, feedback_engine, analytics_engine

router = APIRouter(prefix="/practice", tags=["Practice & Assessment"])


@router.post("/start", response_model=schemas.PracticeSessionOut, status_code=201)
def start_practice(
    payload: schemas.PracticeSessionStart,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(models.RoleEnum.LEARNER)),
):
    lesson = db.query(models.Lesson).filter(models.Lesson.id == payload.lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found.")

    session = models.PracticeSession(learner_id=current_user.id, lesson_id=lesson.id)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.post("/submit-gesture", response_model=schemas.AssessmentResult, status_code=201)
def submit_gesture(
    payload: schemas.GestureFrame,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(models.RoleEnum.LEARNER)),
):
    """
    Core pipeline step. Takes MediaPipe landmarks -> AI prediction ->
    Assessment scoring -> Feedback generation -> Analytics update,
    all in one call (mirrors the PDF's single continuous workflow).
    """
    session = (
        db.query(models.PracticeSession)
        .filter(
            models.PracticeSession.id == payload.session_id,
            models.PracticeSession.learner_id == current_user.id,
        )
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Practice session not found.")

    lesson = db.query(models.Lesson).filter(models.Lesson.id == session.lesson_id).first()

    # Step 6: AI/ML Prediction Layer
    try:
        prediction = ai_prediction.predict(payload.landmarks)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    # Step 7: Assessment Engine
    scores = assessment_engine.evaluate(
        prediction=prediction,
        expected_sign=lesson.expected_sign,
        hold_duration_seconds=payload.hold_duration_seconds,
    )

    assessment = models.Assessment(
        session_id=session.id,
        learner_id=current_user.id,
        predicted_sign=prediction.predicted_sign,
        confidence=prediction.confidence,
        hand_shape_score=scores.hand_shape_score,
        finger_position_score=scores.finger_position_score,
        motion_score=scores.motion_score,
        timing_score=scores.timing_score,
        position_score=scores.position_score,
        overall_accuracy=scores.overall_accuracy,
        passed=scores.passed,
    )
    db.add(assessment)

    session.attempts += 1
    if scores.passed:
        session.status = "completed"
    db.commit()
    db.refresh(assessment)

    # Step 8: Feedback Engine
    mistakes, suggestions = feedback_engine.generate_feedback(scores)
    feedback = models.Feedback(
        assessment_id=assessment.id,
        mistakes=json.dumps(mistakes),
        suggestions=json.dumps(suggestions),
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    # Step 9: Analytics update (weakness detection, running averages)
    analytics_engine.update_after_assessment(db, current_user.id, scores.overall_accuracy)

    return schemas.AssessmentResult(
        assessment=assessment,
        feedback=schemas.FeedbackOut(mistakes=mistakes, suggestions=suggestions),
    )


@router.get("/sessions/{session_id}/assessments", response_model=list[schemas.AssessmentOut])
def get_session_assessments(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    session = db.query(models.PracticeSession).filter(models.PracticeSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Practice session not found.")

    # learners can only view their own sessions; staff can view any
    if current_user.role == models.RoleEnum.LEARNER and session.learner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this session.")

    return session.assessments
