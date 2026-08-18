from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.instructor_student import InstructorStudent
from app.models.user import User
from fastapi import HTTPException
from app.dependencies import get_current_user
from app.schemas.user import AssignStudentRequest

router = APIRouter(
    prefix="/instructor",
    tags=["Instructor"]
)


@router.post("/assign-student")
def assign_student(
    request: AssignStudentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["Admin", "Instructor"]:
        raise HTTPException(
            status_code=403,
            detail="Only Admin or Instructor can assign students"
        )
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
    existing_assignment = db.query(InstructorStudent).filter(
        InstructorStudent.student_id == request.student_id
    ).first()

    if existing_assignment:
        raise HTTPException(
            status_code=409,
            detail="Student is already assigned to an instructor"
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