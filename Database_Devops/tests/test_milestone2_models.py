"""
Tests for Milestone 2 database additions (PDF/SRS FR-4, FR-1, FR-2, FR-3):
Recommendation, InstructorStudent, WeeklyAnalytics tables, plus new
fields on Lesson, Assessment, and Certificate.

These are model/DB-level tests (no HTTP endpoints exist yet for these
tables - that's Intern 2 and Intern 4's job to build on top of this
schema). Purpose here is to prove the schema itself is sound: rows can
be created, relationships resolve correctly, and constraints behave
as designed.
"""

import pytest
from sqlalchemy.exc import IntegrityError

from app import models


class TestLessonNewFields:
    def test_lesson_has_default_category_and_difficulty(self, db_session):
        course = models.Course(title="Alphabet", level="beginner")
        db_session.add(course)
        db_session.flush()

        lesson = models.Lesson(course_id=course.id, title="Letter A", expected_sign="A")
        db_session.add(lesson)
        db_session.commit()

        assert lesson.category == "alphabet"
        assert lesson.difficulty == "easy"

    def test_lesson_can_be_a_word_with_medium_difficulty(self, db_session):
        course = models.Course(title="Common Words", level="intermediate")
        db_session.add(course)
        db_session.flush()

        lesson = models.Lesson(
            course_id=course.id, title="Thank You", expected_sign="THANK_YOU",
            category="word", difficulty="medium",
        )
        db_session.add(lesson)
        db_session.commit()

        assert lesson.category == "word"
        assert lesson.difficulty == "medium"


class TestRecommendation:
    def test_create_recommendation_for_weak_sign(self, db_session):
        user = models.User(
            full_name="Learner One", email="rec_learner@test.com",
            hashed_password="x", role=models.RoleEnum.LEARNER,
        )
        db_session.add(user)
        db_session.flush()

        rec = models.Recommendation(
            learner_id=user.id, sign="M", recommended_sessions=5,
            reason="Below 70% in last 3 attempts",
        )
        db_session.add(rec)
        db_session.commit()

        assert rec.is_active is True
        assert rec.learner.email == "rec_learner@test.com"
        assert user.recommendations[0].sign == "M"

    def test_recommendation_can_be_deactivated_once_resolved(self, db_session):
        user = models.User(
            full_name="Learner Two", email="rec_learner2@test.com",
            hashed_password="x", role=models.RoleEnum.LEARNER,
        )
        db_session.add(user)
        db_session.flush()

        rec = models.Recommendation(learner_id=user.id, sign="N")
        db_session.add(rec)
        db_session.commit()

        rec.is_active = False
        db_session.commit()
        db_session.refresh(rec)
        assert rec.is_active is False


class TestInstructorStudent:
    def test_link_instructor_to_student(self, db_session):
        instructor = models.User(
            full_name="Ms. Smith", email="instructor_link@test.com",
            hashed_password="x", role=models.RoleEnum.INSTRUCTOR,
        )
        student = models.User(
            full_name="Kid One", email="student_link@test.com",
            hashed_password="x", role=models.RoleEnum.LEARNER,
        )
        db_session.add_all([instructor, student])
        db_session.flush()

        link = models.InstructorStudent(instructor_id=instructor.id, student_id=student.id)
        db_session.add(link)
        db_session.commit()

        assert instructor.instructor_links[0].student.email == "student_link@test.com"
        assert student.student_link.instructor.email == "instructor_link@test.com"

    def test_one_instructor_can_have_many_students(self, db_session):
        instructor = models.User(
            full_name="Mr. Jones", email="multi_instructor@test.com",
            hashed_password="x", role=models.RoleEnum.INSTRUCTOR,
        )
        s1 = models.User(full_name="S1", email="s1@test.com", hashed_password="x", role=models.RoleEnum.LEARNER)
        s2 = models.User(full_name="S2", email="s2@test.com", hashed_password="x", role=models.RoleEnum.LEARNER)
        db_session.add_all([instructor, s1, s2])
        db_session.flush()

        db_session.add_all([
            models.InstructorStudent(instructor_id=instructor.id, student_id=s1.id),
            models.InstructorStudent(instructor_id=instructor.id, student_id=s2.id),
        ])
        db_session.commit()

        assert len(instructor.instructor_links) == 2

    def test_a_student_cannot_have_two_instructors(self, db_session):
        """SRS models one-instructor-per-student; student_id is unique."""
        i1 = models.User(full_name="I1", email="i1@test.com", hashed_password="x", role=models.RoleEnum.INSTRUCTOR)
        i2 = models.User(full_name="I2", email="i2@test.com", hashed_password="x", role=models.RoleEnum.INSTRUCTOR)
        student = models.User(full_name="S", email="shared_student@test.com", hashed_password="x", role=models.RoleEnum.LEARNER)
        db_session.add_all([i1, i2, student])
        db_session.flush()

        db_session.add(models.InstructorStudent(instructor_id=i1.id, student_id=student.id))
        db_session.commit()

        db_session.add(models.InstructorStudent(instructor_id=i2.id, student_id=student.id))
        with pytest.raises(IntegrityError):
            db_session.commit()
        db_session.rollback()


class TestWeeklyAnalytics:
    def test_create_weekly_summary_row(self, db_session):
        from datetime import datetime

        user = models.User(
            full_name="Weekly Learner", email="weekly@test.com",
            hashed_password="x", role=models.RoleEnum.LEARNER,
        )
        db_session.add(user)
        db_session.flush()

        week = models.WeeklyAnalytics(
            learner_id=user.id,
            week_start_date=datetime(2026, 7, 6),
            sessions_this_week=8,
            average_accuracy_this_week=82.5,
            improvement_rate=5.0,
            weak_signs_this_week='["M", "N"]',
        )
        db_session.add(week)
        db_session.commit()

        assert user.weekly_stats[0].sessions_this_week == 8

    def test_multiple_weeks_accumulate_history(self, db_session):
        from datetime import datetime

        user = models.User(
            full_name="History Learner", email="history@test.com",
            hashed_password="x", role=models.RoleEnum.LEARNER,
        )
        db_session.add(user)
        db_session.flush()

        db_session.add_all([
            models.WeeklyAnalytics(learner_id=user.id, week_start_date=datetime(2026, 6, 29), average_accuracy_this_week=70.0),
            models.WeeklyAnalytics(learner_id=user.id, week_start_date=datetime(2026, 7, 6), average_accuracy_this_week=78.0),
        ])
        db_session.commit()

        assert len(user.weekly_stats) == 2


class TestAssessmentPossibleIssue:
    def test_assessment_can_store_ai_hint(self, db_session):
        user = models.User(
            full_name="AI Hint Learner", email="ai_hint@test.com",
            hashed_password="x", role=models.RoleEnum.LEARNER,
        )
        course = models.Course(title="Alphabet", level="beginner")
        db_session.add_all([user, course])
        db_session.flush()

        lesson = models.Lesson(course_id=course.id, title="Letter A", expected_sign="A")
        db_session.add(lesson)
        db_session.flush()

        session = models.PracticeSession(learner_id=user.id, lesson_id=lesson.id)
        db_session.add(session)
        db_session.flush()

        assessment = models.Assessment(
            session_id=session.id, learner_id=user.id, predicted_sign="A",
            confidence=90.0, overall_accuracy=60.0,
            possible_issue="thumb position looks off",
        )
        db_session.add(assessment)
        db_session.commit()

        assert assessment.possible_issue == "thumb position looks off"


class TestCertificatePdfPath:
    def test_certificate_can_store_pdf_path(self, db_session):
        user = models.User(
            full_name="Cert Learner", email="cert_pdf@test.com",
            hashed_password="x", role=models.RoleEnum.LEARNER,
        )
        course = models.Course(title="Alphabet", level="beginner")
        db_session.add_all([user, course])
        db_session.flush()

        cert = models.Certificate(
            learner_id=user.id, course_id=course.id, final_score=95.0,
            pdf_path="/certificates/cert_learner_alphabet.pdf",
        )
        db_session.add(cert)
        db_session.commit()

        assert cert.pdf_path == "/certificates/cert_learner_alphabet.pdf"
