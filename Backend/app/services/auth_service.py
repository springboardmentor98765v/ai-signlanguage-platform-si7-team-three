import os
import bcrypt
from jose import jwt
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.models.user import User

SECRET_KEY = os.getenv("SECRET_KEY", "mysupersecretkey")
ALGORITHM = "HS256"


def register_user(user, db: Session):

    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        return {
            "message": "Email already registered"
        }

    hashed_password = bcrypt.hashpw(
        user.password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    # Default role
    role = "Learner"

    # Allow admin/instructor only if specified
    if hasattr(user, "role"):
        if user.role in ["Learner", "Instructor", "Admin"]:
            role = user.role

    new_user = User(
        full_name=user.full_name,
        email=user.email,
        hashed_password=hashed_password,
        role=role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": f"{role} registered successfully"
    }


def login_user(user, db: Session):

    db_user = db.query(User).filter(User.email == user.email).first()

    if db_user and bcrypt.checkpw(
        user.password.encode("utf-8"),
        db_user.hashed_password.encode("utf-8")
    ):

        payload = {
            "sub": db_user.email,
            "role": db_user.role,
            "exp": datetime.utcnow() + timedelta(hours=1)
        }

        token = jwt.encode(
            payload,
            SECRET_KEY,
            algorithm=ALGORITHM
        )

        return token

    return None