from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.instructor_student import InstructorStudent
from app.models.user import User
from fastapi import HTTPException
from app.schemas.user import AssignStudentRequest

router = APIRouter(
    prefix="/instructor",
    tags=["Instructor"]
)


@router.post("/assign-student")
def assign_student(
    request: AssignStudentRequest,
    db: Session = Depends(get_db)
):
    instructor = db.query(User).filter(User.id == request.instructor_id).first()

    if instructor is None:
        raise HTTPException(
            status_code=404,
            detail="Instructor not found"
        )

    student = db.query(User).filter(User.id == request.student_id).first()

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    assignment = InstructorStudent(
        instructor_id=request.instructor_id,
        student_id=request.student_id
    )

    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    return {
        "message": "Student assigned successfully",
        "assignment_id": assignment.id
    }


@router.get("/students")
def get_students(db: Session = Depends(get_db)):
    students = db.query(InstructorStudent).all()

    return students