from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="Learner")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    # Instructor -> many students
    instructor_links = relationship(
        "InstructorStudent",
        back_populates="instructor",
        foreign_keys="InstructorStudent.instructor_id",
    )

    # Student -> one instructor
    student_link = relationship(
        "InstructorStudent",
        back_populates="student",
        foreign_keys="InstructorStudent.student_id",
        uselist=False,
    )