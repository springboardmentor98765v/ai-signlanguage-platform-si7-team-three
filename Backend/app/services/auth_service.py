import bcrypt
from jose import jwt
from datetime import datetime, timedelta

SECRET_KEY = "mysupersecretkey"
ALGORITHM = "HS256"

users_db = []


def register_user(user):
    hashed_password = bcrypt.hashpw(
        user.password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    users_db.append({
        "full_name": user.full_name,
        "email": user.email,
        "password": hashed_password
    })

    return {"message": "User registered successfully"}


def login_user(user):
    for db_user in users_db:
        if db_user["email"] == user.email:
            if bcrypt.checkpw(
                user.password.encode("utf-8"),
                db_user["password"].encode("utf-8")
            ):
                payload = {
                    "sub": user.email,
                    "exp": datetime.utcnow() + timedelta(hours=1)
                }

                token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

                return {
                    "access_token": token,
                    "token_type": "bearer"
                }

    return {"message": "Invalid credentials"}