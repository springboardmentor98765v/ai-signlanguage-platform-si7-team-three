from datetime import datetime

from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from app.database import Base


class InstructorStudent(Base):
    __tablename__ = "instructor_students"

    id = Column(Integer, primary_key=True, index=True)

    instructor_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    student_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    assigned_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    instructor = relationship(
        "User",
        foreign_keys=[instructor_id],
        back_populates="instructor_links"
    )

    student = relationship(
        "User",
        foreign_keys=[student_id],
        back_populates="student_link"
    )