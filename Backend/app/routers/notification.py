from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_admin
from app.dependencies import get_current_user
from app.models.user import User
from app.models.notification import Notification

from app.schemas.notification import NotificationCreate
from app.services.notification_service import (
    create_notification,
    get_notifications,
    mark_notification_read,
)

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


@router.post("/")
def create_notification_api(
    notification: NotificationCreate,
    current_user:User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    return create_notification(
        db,
        notification.user_id,
        notification.title,
        notification.message
    )


@router.get("/{user_id}")
def get_notifications_api(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.id != user_id and current_user.role != "Admin":
        raise HTTPException(
            status_code=403,
            detail="You can only access your own notifications"
        )

    return get_notifications(db, user_id)


@router.put("/{notification_id}/read")
def mark_notification_read_api(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notification = db.query(Notification).filter(
        Notification.id == notification_id
    ).first()

    if notification is None:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    if notification.user_id != current_user.id and current_user.role != "Admin":
        raise HTTPException(
            status_code=403,
            detail="You can only update your own notifications"
        )

    notification = mark_notification_read(db, notification_id)

    return notification