from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from app.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    title = Column(String, nullable=False)

    message = Column(String, nullable=False)

    is_read = Column(Boolean, default=False)