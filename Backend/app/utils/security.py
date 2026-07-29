import os
from jose import jwt, JWTError

SECRET_KEY = os.getenv("SECRET_KEY", "mysupersecretkey")
ALGORITHM = os.getenv("ALGORITHM", "HS256")


def create_access_token(data: dict):
    return jwt.encode(
        data,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def verify_token(token: str):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        return payload

    except JWTError:
        return None