from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.user import BulkStatusUpdateRequest
from app.database import get_db
from app.models.user import User
from app.dependencies import require_admin

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@router.get("/users")
def get_all_users(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    return db.query(User).all()


@router.put("/users/{user_id}/status")
def update_user_status(
    user_id: int,
    is_active: bool,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user.is_active = is_active

    db.commit()
    db.refresh(user)

    return {
        "message": "User status updated successfully",
        "user": user
    }

@router.put("/users/bulk-status")
def bulk_update_user_status(
    request: BulkStatusUpdateRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    users = (
        db.query(User)
        .filter(User.id.in_(request.user_ids))
        .all()
    )

    if not users:
        raise HTTPException(
            status_code=404,
            detail="No users found"
        )

    for user in users:
        user.is_active = request.is_active

    db.commit()

    return {
        "message": f"{len(users)} users updated successfully"
    }   


@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user.role = role

    db.commit()
    db.refresh(user)

    return {
        "message": "User role updated successfully",
        "user": user
    }