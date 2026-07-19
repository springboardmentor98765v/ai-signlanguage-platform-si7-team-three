"""
Authentication core (PDF Step 1: User Layer + Step 3: API Gateway's
"Authentication Validation" duty).

Handles password hashing and JWT issuing/verification. In the PDF's
words, this decides "who is using the system" and hands that identity
to every other layer via a bearer token.
"""

import os
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app import models

# In production, load this from an environment variable / secrets manager.
SECRET_KEY = os.environ.get("SLP_SECRET_KEY", "dev-secret-change-me-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8  # 8 hour session

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# HTTPBearer gives a simple "paste your token" box in Swagger UI, unlike
# OAuth2PasswordBearer which renders a username/password login form that
# doesn't match this API's JSON-body /auth/login endpoint.
oauth2_scheme = HTTPBearer()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> models.User:
    """
    This is the API Gateway's authentication check, implemented as
    FastAPI middleware/dependency per the PDF's suggestion for interns
    ("implement these functionalities directly inside FastAPI middleware").
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if user is None or not user.is_active:
        raise credentials_exception
    return user


def require_role(*allowed_roles: models.RoleEnum):
    """
    Role-Based Access Control dependency factory (PDF: "A learner can
    practice signs but cannot create courses. An instructor can monitor
    student performance but cannot change system settings.").

    Usage: Depends(require_role(RoleEnum.ADMIN, RoleEnum.INSTRUCTOR))
    """
    def role_checker(current_user: models.User = Depends(get_current_user)) -> models.User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{current_user.role.value}' is not permitted to perform this action.",
            )
        return current_user
    return role_checker
