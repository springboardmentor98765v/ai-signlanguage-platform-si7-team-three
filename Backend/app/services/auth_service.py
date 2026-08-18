import random
import smtplib
from email.message import EmailMessage
import os
import bcrypt
import time

login_attempts = {}
MAX_LOGIN_ATTEMPTS = 5
LOGIN_WINDOW = 60
from app.utils.security import create_access_token
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.utils.security import ACCESS_TOKEN_EXPIRE_DAYS

from app.models.user import User

SECRET_KEY = os.getenv("SECRET_KEY", "mysupersecretkey")
ALGORITHM = os.getenv("ALGORITHM", "HS256")


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

    # New registrations always start as Learner.
    # Admin can change the role later through the admin API.
    role = "Learner"

    new_user = User(
        full_name=user.full_name,
        email=user.email,
        hashed_password=hashed_password,
        role=role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    payload = {
        "sub": new_user.email,
        "role": new_user.role,
        "exp": datetime.utcnow() + timedelta(hours=1)
    }

    token = create_access_token(payload)

    return {
        "message": f"{role} registered successfully",
        "token": token,
        "user": {
            "id": new_user.id,
            "name": new_user.full_name,
            "email": new_user.email,
            "role": new_user.role,
            "profileComplete": True
        }
    }
 


def login_user(user, db: Session):

    email = str(user.email).lower()
    now = time.time()

    # Remove attempts older than 60 seconds
    if email not in login_attempts:
        login_attempts[email] = []

    login_attempts[email] = [
        timestamp
        for timestamp in login_attempts[email]
        if now - timestamp < LOGIN_WINDOW
    ]

    # Block after 5 attempts within one minute
    if len(login_attempts[email]) >= MAX_LOGIN_ATTEMPTS:
        raise HTTPException(
            status_code=429,
            detail="Too many login attempts. Please try again later."
        )

    db_user = db.query(User).filter(User.email == user.email).first()

    if db_user and bcrypt.checkpw(
        user.password.encode("utf-8"),
        db_user.hashed_password.encode("utf-8")
    ):

        # Successful login — clear failed attempts
        login_attempts[email] = []

        payload = {
            "sub": db_user.email,
            "role": db_user.role,
            "exp": datetime.utcnow() + timedelta(
                days=ACCESS_TOKEN_EXPIRE_DAYS
            )
        }

        token = create_access_token(payload)

        return {
            "token": token,
            "user": {
                "id": db_user.id,
                "name": db_user.full_name,
                "email": db_user.email,
                "role": db_user.role,
                "profileComplete": True
            }
        }

    # Record failed attempt
    login_attempts[email].append(now)

    return None


def update_profile(user_id: int, user_data, db: Session):

    db_user = db.query(User).filter(User.id == user_id).first()

    if db_user is None:
        return None

    # Update profile fields
    db_user.full_name = user_data.full_name
    db_user.email = user_data.email

    db.commit()
    db.refresh(db_user)

    return {
        "message": "Profile updated successfully",
        "user": {
            "id": db_user.id,
            "full_name": db_user.full_name,
            "email": db_user.email,
            "role": db_user.role
        }
    }
def forgot_password(request, db: Session):

    db_user = db.query(User).filter(User.email == request.email).first()

    if db_user is None:
        return {
            "message": "User not found"
        }

    otp = str(random.randint(100000, 999999))

    email = EmailMessage()
    email["Subject"] = "Password Reset OTP"
    email["From"] = os.getenv("SMTP_EMAIL")
    email["To"] = request.email

    email.set_content(
        f"""
Hello {db_user.full_name},
Your OTP for password reset is:

{otp}

This OTP is valid for a short time.

AI Sign Language Platform
"""
    )

    try:
        with smtplib.SMTP(
            os.getenv("SMTP_SERVER"),
            int(os.getenv("SMTP_PORT"))
        ) as smtp:
            smtp.starttls()
            smtp.login(
                os.getenv("SMTP_EMAIL"),
                os.getenv("SMTP_PASSWORD")
            )
            smtp.send_message(email)

        return {
            "message": "OTP sent successfully",
            "otp": otp
        }

    except Exception as e:
        return {
            "message": "Failed to send email",
            "error": str(e)
        } 
def change_password(request, db: Session):

    db_user = db.query(User).filter(User.email == request.email).first()

    if db_user is None:
        return {
            "message": "User not found"
        }

    if not bcrypt.checkpw(
        request.current_password.encode("utf-8"),
        db_user.hashed_password.encode("utf-8")
    ):
        return {
            "message": "Current password is incorrect"
        }

    hashed_password = bcrypt.hashpw(
        request.new_password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    db_user.hashed_password = hashed_password

    db.commit()

    return {
        "message": "Password changed successfully"
    }        