"""
Course Service Router (PDF Step 4 - Course Service: Lessons, Modules,
Learning content). Instructors/Admins manage content; all authenticated
users can browse it.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/courses", tags=["Courses"])

MANAGE_ROLES = (models.RoleEnum.INSTRUCTOR, models.RoleEnum.ACCESSIBILITY_TRAINER, models.RoleEnum.ADMIN)


@router.post("", response_model=schemas.CourseOut, status_code=201)
def create_course(
    payload: schemas.CourseCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role(*MANAGE_ROLES)),
):
    course = models.Course(**payload.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.get("", response_model=List[schemas.CourseOut])
def list_courses(db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    return db.query(models.Course).all()


@router.get("/{course_id}", response_model=schemas.CourseOut)
def get_course(course_id: int, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found.")
    return course


@router.post("/{course_id}/lessons", response_model=schemas.LessonOut, status_code=201)
def add_lesson(
    course_id: int,
    payload: schemas.LessonCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role(*MANAGE_ROLES)),
):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found.")

    lesson = models.Lesson(course_id=course_id, **payload.model_dump())
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson
