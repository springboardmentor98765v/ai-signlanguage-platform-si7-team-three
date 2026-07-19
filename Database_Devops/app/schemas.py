"""
Pydantic schemas - the contracts between the Frontend and the API,
per the PDF's "the frontend never performs computation, it just sends/
receives JSON" principle.
"""

from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, EmailStr, ConfigDict

from app.models import RoleEnum


# ---------- User / Auth (Module 1) ----------

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: RoleEnum = RoleEnum.LEARNER


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    full_name: str
    email: EmailStr
    role: RoleEnum
    is_active: bool
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Course / Lesson (Module 2) ----------

class LessonCreate(BaseModel):
    title: str
    expected_sign: str
    instructions: Optional[str] = None
    order_index: int = 0


class LessonOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    expected_sign: str
    instructions: Optional[str]
    order_index: int


class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    level: str = "beginner"


class CourseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    description: Optional[str]
    level: str
    lessons: List[LessonOut] = []


# ---------- Practice (Module 3) ----------

class PracticeSessionStart(BaseModel):
    lesson_id: int


class PracticeSessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    lesson_id: int
    status: str
    attempts: int
    started_at: datetime


class GestureFrame(BaseModel):
    """
    A single frame's worth of already-extracted hand landmarks
    (21 points × x,y,z), as produced by MediaPipe on the frontend
    or a preceding capture step. Sending landmarks instead of raw
    images keeps payloads small, per PDF Step 5.
    """
    session_id: int
    landmarks: List[List[float]]  # 21 x [x, y, z]
    hold_duration_seconds: float = 1.0


# ---------- Assessment (Module 4) ----------

class AssessmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    predicted_sign: str
    confidence: float
    hand_shape_score: float
    finger_position_score: float
    motion_score: float
    timing_score: float
    position_score: float
    overall_accuracy: float
    passed: bool
    created_at: datetime


# ---------- Feedback (Module 5) ----------

class FeedbackOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    mistakes: List[str]
    suggestions: List[str]


class AssessmentResult(BaseModel):
    """Combined response returned right after a gesture is evaluated."""
    assessment: AssessmentOut
    feedback: FeedbackOut


# ---------- Analytics / Dashboard (Module 6) ----------

class AnalyticsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    total_sessions: int
    total_practice_minutes: float
    lessons_completed: int
    average_accuracy: float
    improvement_rate: float
    weak_signs: List[str]
    last_updated: datetime


# ---------- Certificate ----------

class CertificateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    course_id: int
    skill_level: str
    final_score: float
    issued_at: datetime
