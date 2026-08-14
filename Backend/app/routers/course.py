from fastapi import APIRouter, HTTPException, Query, Depends
from app.schemas.course import Course, Lesson
from app.models.user import User
from app.dependencies import get_current_user
from app.services.course_service import (
    get_all_courses,
    get_course,
    create_course,
    update_course,
    delete_course,
    search_lessons,
    create_lesson,
    update_lesson,
    delete_lesson,
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

@router.post("/{course_id}/modules/{module_id}/lessons")
def add_lesson(
    course_id: int,
    module_id: int,
    lesson: Lesson,
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["Admin", "Instructor"]:
        raise HTTPException(
            status_code=403,
            detail={
                "success": False,
                "message": "Access denied. Only Admins and Instructors can create lessons."
            }
        )

    created = create_lesson(course_id, module_id, lesson)

    if created is None:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "message": "Course or Module not found."
            }
        )

    return created

@router.put("/{course_id}/modules/{module_id}/lessons/{lesson_id}")
def edit_lesson(
    course_id: int,
    module_id: int,
    lesson_id: int,
    lesson: Lesson,
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["Admin", "Instructor"]:
        raise HTTPException(
            status_code=403,
            detail="Only Admin or Instructor can edit lessons"
        )

    updated = update_lesson(course_id, module_id, lesson_id, lesson)

    if updated is None:
        raise HTTPException(
            status_code=404,
            detail="Lesson not found"
        )

    return updated

@router.delete("/{course_id}/modules/{module_id}/lessons/{lesson_id}")
def remove_lesson(
    course_id: int,
    module_id: int,
    lesson_id: int,
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["Admin", "Instructor"]:
        raise HTTPException(
            status_code=403,
            detail="Only Admin or Instructor can delete lessons"
        )

    deleted = delete_lesson(course_id, module_id, lesson_id)

    if deleted is None:
        raise HTTPException(
            status_code=404,
            detail="Lesson not found"
        )

    return {"message": "Lesson deleted successfully"}

@router.get("/{course_id}")
def read_course(course_id: int):
    course = get_course(course_id)
    if course is None:
        raise HTTPException(
            status_code=404,
            detail={
                "success":False,
                "message":"Course not found."
            }
        )
    return course


@router.post("/")
def add_course(course: Course):
    return create_course(course)


@router.put("/{course_id}")
def edit_course(course_id: int, course: Course):
    updated = update_course(course_id, course)
    if updated is None:
        raise HTTPException(
            status_code=404, 
            detail={
                "success":False,
                "message":"Course not found."
            }   
        )
    return updated


@router.delete("/{course_id}")
def remove_course(course_id: int):
    deleted = delete_course(course_id)
    if deleted is None:
        raise HTTPException(
            status_code=404, 
            detail={
                "success":False,
                "message":"Course not found."
            }
        )
    return {"message": "Course deleted successfully"}