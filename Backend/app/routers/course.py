from fastapi import APIRouter, HTTPException, Query
from app.schemas.course import Course
from app.services.course_service import (
    get_all_courses,
    get_course,
    create_course,
    update_course,
    delete_course,
    search_lessons,
)

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.get("/")
def read_courses(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1)
):
    return get_all_courses(page, limit)

@router.get("/search/")
def search_course_lessons(keyword: str):
    return search_lessons(keyword)

@router.get("/{course_id}")
def read_course(course_id: int):
    course = get_course(course_id)
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.post("/")
def add_course(course: Course):
    return create_course(course)


@router.put("/{course_id}")
def edit_course(course_id: int, course: Course):
    updated = update_course(course_id, course)
    if updated is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return updated


@router.delete("/{course_id}")
def remove_course(course_id: int):
    deleted = delete_course(course_id)
    if deleted is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"message": "Course deleted successfully"}