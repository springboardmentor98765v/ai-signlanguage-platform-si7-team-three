import bcrypt
from jose import jwt
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.models.user import User

SECRET_KEY = "mysupersecretkey"
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

    new_user = User(
        full_name=user.full_name,
        email=user.email,
        hashed_password=hashed_password,
        role="Learner"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully"
    }


def login_user(user, db: Session):

    db_user = db.query(User).filter(User.email == user.email).first()

    if db_user and bcrypt.checkpw(
        user.password.encode("utf-8"),
        db_user.hashed_password.encode("utf-8")
    ):

        payload = {
            "sub": user.email,
            "exp": datetime.utcnow() + timedelta(hours=1)
        }

        token = jwt.encode(
            payload,
            SECRET_KEY,
            algorithm=ALGORITHM
        )

        return token

    return None