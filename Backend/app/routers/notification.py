from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
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
    db: Session = Depends(get_db)
):
    return get_notifications(db, user_id)


@router.put("/{notification_id}/read")
def mark_notification_read_api(
    notification_id: int,
    db: Session = Depends(get_db)
):
    notification = mark_notification_read(db, notification_id)

    if notification is None:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    return notification