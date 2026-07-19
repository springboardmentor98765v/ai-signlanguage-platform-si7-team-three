"""
Analytics Router (PDF Outcome 5 - Learning Analytics and Personalized
Recommendations) + Certification Router (PDF Outcome 6).
"""

import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.auth import get_current_user, require_role
from app.services import analytics_engine

router = APIRouter(tags=["Analytics & Certificates"])


@router.get("/analytics/me", response_model=schemas.AnalyticsOut)
def get_my_analytics(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    analytics = db.query(models.LearningAnalytics).filter_by(learner_id=current_user.id).first()
    if not analytics:
        raise HTTPException(status_code=404, detail="No analytics yet - complete a practice session first.")
    return schemas.AnalyticsOut(
        total_sessions=analytics.total_sessions,
        total_practice_minutes=analytics.total_practice_minutes,
        lessons_completed=analytics.lessons_completed,
        average_accuracy=analytics.average_accuracy,
        improvement_rate=analytics.improvement_rate,
        weak_signs=json.loads(analytics.weak_signs or "[]"),
        last_updated=analytics.last_updated,
    )


@router.get("/analytics/me/recommendations")
def get_my_recommendations(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """PDF example: 'Letter M - 5 Sessions, Letter N - 4 Sessions, Letter R - 6 Sessions'."""
    analytics = db.query(models.LearningAnalytics).filter_by(learner_id=current_user.id).first()
    if not analytics:
        return {"recommendations": []}
    return {"recommendations": analytics_engine.recommend_practice(analytics)}


@router.post("/certificates/issue/{course_id}", response_model=schemas.CertificateOut, status_code=201)
def issue_certificate(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(models.RoleEnum.LEARNER)),
):
    """PDF Outcome 6: certificates issued upon successfully completing assessments."""
    analytics = db.query(models.LearningAnalytics).filter_by(learner_id=current_user.id).first()
    if not analytics or analytics.average_accuracy < 70.0:
        raise HTTPException(
            status_code=400,
            detail="Average accuracy must be at least 70% to receive a certificate.",
        )

    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found.")

    skill_level = "advanced" if analytics.average_accuracy >= 90 else "intermediate" if analytics.average_accuracy >= 80 else "beginner"

    certificate = models.Certificate(
        learner_id=current_user.id,
        course_id=course_id,
        skill_level=skill_level,
        final_score=analytics.average_accuracy,
    )
    db.add(certificate)
    db.commit()
    db.refresh(certificate)
    return certificate
