"""
Learning Analytics / Progress Intelligence (PDF Outcome 5, Step 9).

Recomputes a learner's LearningAnalytics row after each assessment:
running averages, lessons completed, and weak-sign detection so the
platform can recommend targeted practice (e.g. "Letter M - 5 sessions").
"""

import json
from datetime import datetime
from typing import List

from sqlalchemy.orm import Session

from app import models

WEAK_SIGN_THRESHOLD = 70.0  # overall_accuracy below this counts as a "miss" for that sign
WEAK_SIGN_MIN_MISSES = 2    # how many misses before a sign is flagged as weak


def _get_or_create_analytics(db: Session, learner_id: int) -> models.LearningAnalytics:
    analytics = db.query(models.LearningAnalytics).filter_by(learner_id=learner_id).first()
    if not analytics:
        analytics = models.LearningAnalytics(learner_id=learner_id, weak_signs="[]")
        db.add(analytics)
        db.flush()
    return analytics


def _detect_weak_signs(db: Session, learner_id: int) -> List[str]:
    """Counts recent misses per expected sign and flags recurring weak spots."""
    assessments = (
        db.query(models.Assessment, models.PracticeSession, models.Lesson)
        .join(models.PracticeSession, models.Assessment.session_id == models.PracticeSession.id)
        .join(models.Lesson, models.PracticeSession.lesson_id == models.Lesson.id)
        .filter(models.Assessment.learner_id == learner_id)
        .order_by(models.Assessment.created_at.desc())
        .limit(50)
        .all()
    )

    miss_counts = {}
    for assessment, _session, lesson in assessments:
        if assessment.overall_accuracy < WEAK_SIGN_THRESHOLD:
            miss_counts[lesson.expected_sign] = miss_counts.get(lesson.expected_sign, 0) + 1

    return sorted([sign for sign, count in miss_counts.items() if count >= WEAK_SIGN_MIN_MISSES])


def update_after_assessment(db: Session, learner_id: int, overall_accuracy: float) -> models.LearningAnalytics:
    """Called right after an Assessment is saved. Recomputes rolling analytics."""
    analytics = _get_or_create_analytics(db, learner_id)

    total_assessments = db.query(models.Assessment).filter_by(learner_id=learner_id).count()
    prev_avg = analytics.average_accuracy or 0.0
    prev_count = max(total_assessments - 1, 0)

    new_avg = round(((prev_avg * prev_count) + overall_accuracy) / total_assessments, 1) if total_assessments else overall_accuracy
    improvement_rate = round(overall_accuracy - prev_avg, 1) if prev_count > 0 else 0.0

    completed_sessions = (
        db.query(models.PracticeSession)
        .filter_by(learner_id=learner_id, status="completed")
        .count()
    )

    analytics.total_sessions = db.query(models.PracticeSession).filter_by(learner_id=learner_id).count()
    analytics.lessons_completed = completed_sessions
    analytics.average_accuracy = new_avg
    analytics.improvement_rate = improvement_rate
    analytics.weak_signs = json.dumps(_detect_weak_signs(db, learner_id))
    analytics.last_updated = datetime.utcnow()

    db.commit()
    db.refresh(analytics)
    return analytics


def recommend_practice(analytics: models.LearningAnalytics) -> List[dict]:
    """PDF example: 'Letter M - 5 Sessions, Letter N - 4 Sessions, Letter R - 6 Sessions'."""
    weak_signs = json.loads(analytics.weak_signs or "[]")
    # more sessions recommended for signs earlier in the weak list (arbitrary but deterministic)
    return [
        {"sign": sign, "recommended_sessions": 4 + i}
        for i, sign in enumerate(weak_signs)
    ]
