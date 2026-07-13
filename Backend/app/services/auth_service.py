import bcrypt
from jose import jwt
from datetime import datetime, timedelta

from app.database import users_collection

SECRET_KEY = "mysupersecretkey"
ALGORITHM = "HS256"


def register_user(user):
    # Check if email already exists
    existing_user = users_collection.find_one({"email": user.email})

    if existing_user:
        return {
            "message": "Email already registered"
        }

    # Hash password
    hashed_password = bcrypt.hashpw(
        user.password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    # Save user to MongoDB
    users_collection.insert_one({
        "full_name": user.full_name,
        "email": user.email,
        "password": hashed_password
    })

    return {
        "message": "User registered successfully"
    }


def login_user(user):
    # Find user in MongoDB
    db_user = users_collection.find_one({
        "email": user.email
    })

    if db_user:
        if bcrypt.checkpw(
            user.password.encode("utf-8"),
            db_user["password"].encode("utf-8")
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