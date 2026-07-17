from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.schemas.user import (
    UserRegister,
    UserLogin,
    UserUpdate,
    ForgotPasswordRequest
)
from app.services.auth_service import (
    register_user,
    login_user,
    update_profile,
    forgot_password
)
from app.database import get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    return register_user(user, db)


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    token = login_user(user, db)

    if token is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.put("/profile/{user_id}")
def edit_profile(
    user_id: int,
    user: UserUpdate,
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
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    return forgot_password(request, db)    