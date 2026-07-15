"""
Database models covering every module described in the PDF:

  User Layer          -> User, RoleEnum                (Outcome 2)
  Course Service       -> Course, Lesson                (Outcome 1)
  Practice Service      -> PracticeSession               (Outcome 3)
  Assessment Service    -> Assessment                    (Outcome 3, 6)
  Feedback Service      -> Feedback                      (Outcome 4, 5)
  Analytics Service     -> LearningAnalytics              (Outcome 5)
  Certification         -> Certificate                   (Outcome 6)
"""

import enum
from datetime import datetime

from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey, Enum, Text, Boolean
)
from sqlalchemy.orm import relationship

from app.database import Base


class RoleEnum(str, enum.Enum):
    """Role-Based Access Control roles, per the PDF's User Layer section."""
    LEARNER = "learner"
    INSTRUCTOR = "instructor"
    ACCESSIBILITY_TRAINER = "accessibility_trainer"
    ADMIN = "admin"


class User(Base):
    """
    User Layer (PDF Step 1).
    Answers: "Who is using the system?"
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.LEARNER, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    practice_sessions = relationship("PracticeSession", back_populates="learner")
    assessments = relationship("Assessment", back_populates="learner")
    certificates = relationship("Certificate", back_populates="learner")
    analytics = relationship("LearningAnalytics", back_populates="learner", uselist=False)
    recommendations = relationship("Recommendation", back_populates="learner")
    weekly_stats = relationship("WeeklyAnalytics", back_populates="learner")

    # Instructor-Student mapping (Milestone 2): a learner has one instructor
    # link record; an instructor has many student link records. Two separate
    # relationships on the same table, disambiguated by foreign_keys.
    instructor_links = relationship(
        "InstructorStudent", back_populates="instructor",
        foreign_keys="InstructorStudent.instructor_id",
    )
    student_link = relationship(
        "InstructorStudent", back_populates="student",
        foreign_keys="InstructorStudent.student_id", uselist=False,
    )


class Course(Base):
    """Course Service (PDF Step 4 - Backend Service Layer)."""
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    level = Column(String(50), default="beginner")  # beginner/intermediate/advanced
    created_at = Column(DateTime, default=datetime.utcnow)

    lessons = relationship("Lesson", back_populates="course", cascade="all, delete-orphan")


class Lesson(Base):
    """
    A single sign to learn/practice (e.g. Letter 'A').
    `expected_sign` is what the AI/ML layer compares the prediction against.
    """
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String(150), nullable=False)          # e.g. "Letter A"
    expected_sign = Column(String(50), nullable=False)    # e.g. "A"
    instructions = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)

    # Milestone 2 (FR-2): bigger, searchable, paginated catalogue needs these
    # to filter/browse by. category distinguishes single-letter signs from
    # simple common words; difficulty is a simple Easy/Medium split per SRS.
    category = Column(String(30), default="alphabet")   # alphabet/word
    difficulty = Column(String(20), default="easy")       # easy/medium

    course = relationship("Course", back_populates="lessons")
    practice_sessions = relationship("PracticeSession", back_populates="lesson")


class PracticeSession(Base):
    """
    Practice Service (PDF Step 4 & 5).
    Created when a learner clicks "Start Practice".
    """
    __tablename__ = "practice_sessions"

    id = Column(Integer, primary_key=True, index=True)
    learner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    attempts = Column(Integer, default=0)
    status = Column(String(30), default="in_progress")  # in_progress/completed

    learner = relationship("User", back_populates="practice_sessions")
    lesson = relationship("Lesson", back_populates="practice_sessions")
    assessments = relationship("Assessment", back_populates="session", cascade="all, delete-orphan")


class Assessment(Base):
    """
    Assessment Service (PDF Step 7 - "The Digital Examiner").
    Stores the AI prediction + the multi-parameter scoring breakdown.
    """
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("practice_sessions.id"), nullable=False)
    learner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    predicted_sign = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=False)

    hand_shape_score = Column(Float, default=0.0)
    finger_position_score = Column(Float, default=0.0)
    motion_score = Column(Float, default=0.0)
    timing_score = Column(Float, default=0.0)
    position_score = Column(Float, default=0.0)
    overall_accuracy = Column(Float, default=0.0)

    passed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Milestone 2 (FR-3): Intern 3's AI service returns a basic hint about
    # what likely went wrong (e.g. "thumb position looks off"), which
    # Intern 4's Feedback Engine uses alongside its own rule-based messages.
    possible_issue = Column(String(255), nullable=True)

    session = relationship("PracticeSession", back_populates="assessments")
    learner = relationship("User", back_populates="assessments")
    feedback = relationship("Feedback", back_populates="assessment", uselist=False, cascade="all, delete-orphan")


class Feedback(Base):
    """
    Feedback Service (PDF Step 8 - "The Personal Tutor").
    One feedback record per assessment, listing specific mistakes + tips.
    """
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    mistakes = Column(Text, nullable=True)      # JSON-encoded list of strings
    suggestions = Column(Text, nullable=True)   # JSON-encoded list of strings
    created_at = Column(DateTime, default=datetime.utcnow)

    assessment = relationship("Assessment", back_populates="feedback")


class LearningAnalytics(Base):
    """
    Analytics Service (PDF Step 9 - "The Memory and Progress Tracker").
    One row per learner, updated after every assessment.
    """
    __tablename__ = "learning_analytics"

    id = Column(Integer, primary_key=True, index=True)
    learner_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    total_sessions = Column(Integer, default=0)
    total_practice_minutes = Column(Float, default=0.0)
    lessons_completed = Column(Integer, default=0)
    average_accuracy = Column(Float, default=0.0)
    improvement_rate = Column(Float, default=0.0)
    weak_signs = Column(Text, nullable=True)  # JSON-encoded list, e.g. ["M","N","R"]
    last_updated = Column(DateTime, default=datetime.utcnow)

    learner = relationship("User", back_populates="analytics")


class Certificate(Base):
    """Certification module (PDF Outcome 6)."""
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    learner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    skill_level = Column(String(50), default="beginner")
    final_score = Column(Float, nullable=False)
    issued_at = Column(DateTime, default=datetime.utcnow)

    # Milestone 2 (FR-4): Intern 4 generates a real PDF (ReportLab/pdf-lib);
    # this stores where that file lives so it can be downloaded later
    # instead of just being a database record with no actual document.
    pdf_path = Column(String(500), nullable=True)

    learner = relationship("User", back_populates="certificates")


class Recommendation(Base):
    """
    Milestone 2 (FR-4) - Recommendation Engine.
    One row per weak sign the system suggests extra practice for.
    Created by Intern 4's logic: "below 70% in the last 3 attempts ->
    recommend extra practice" (SRS Day 4).
    """
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    learner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sign = Column(String(50), nullable=False)               # e.g. "M"
    recommended_sessions = Column(Integer, default=3)
    reason = Column(String(255), nullable=True)              # e.g. "Below 70% in last 3 attempts"
    is_active = Column(Boolean, default=True)                # False once the learner improves past threshold
    created_at = Column(DateTime, default=datetime.utcnow)

    learner = relationship("User", back_populates="recommendations")


class InstructorStudent(Base):
    """
    Milestone 2 (FR-1, FR-2) - Instructor-Student mapping.
    Links an Instructor (role=instructor) to the Learners they oversee,
    so the Instructor Dashboard can show "my students" only.
    One learner has at most one instructor (uselist=False on User.student_link);
    one instructor can have many students.
    """
    __tablename__ = "instructor_students"

    id = Column(Integer, primary_key=True, index=True)
    instructor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow)

    instructor = relationship("User", back_populates="instructor_links", foreign_keys=[instructor_id])
    student = relationship("User", back_populates="student_link", foreign_keys=[student_id])


class WeeklyAnalytics(Base):
    """
    Milestone 2 (FR-4, FR-5) - Weekly Analytics.
    One row per learner per calendar week, so the dashboard can show
    "how much did I improve this week" instead of only an all-time average
    (which is what LearningAnalytics already covers).
    """
    __tablename__ = "weekly_analytics"

    id = Column(Integer, primary_key=True, index=True)
    learner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    week_start_date = Column(DateTime, nullable=False)  # Monday of the week this row summarizes

    sessions_this_week = Column(Integer, default=0)
    average_accuracy_this_week = Column(Float, default=0.0)
    improvement_rate = Column(Float, default=0.0)  # vs previous week's average
    weak_signs_this_week = Column(Text, nullable=True)  # JSON-encoded list
    created_at = Column(DateTime, default=datetime.utcnow)

    learner = relationship("User", back_populates="weekly_stats")
