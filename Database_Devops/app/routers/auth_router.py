"""
Auth Router (PDF Step 1 & Outcome 2 - Secure Authentication and User Management).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.auth import hash_password, verify_password, create_access_token
from app.services.auth_service import (
    update_profile,
    forgot_password,
    change_password,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def register(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")

    user = models.User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return schemas.Token(access_token=token, user=user)


@router.post("/login", response_model=schemas.Token)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="This account has been deactivated.")

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return schemas.Token(access_token=token, user=user)

@router.put("/profile/{user_id}")
def edit_profile(
    user_id: int,
    user: schemas.UserUpdate,
    db: Session = Depends(get_db)
):
    updated_user = update_profile(user_id, user, db)

    if updated_user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return updated_user


@router.post("/forgot-password")
def forgot_password_api(
    request: schemas.ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    return forgot_password(request, db)


@router.post("/change-password")
def change_password_api(
    request: schemas.ChangePasswordRequest,
    db: Session = Depends(get_db)
):
    return change_password(request, db)    
