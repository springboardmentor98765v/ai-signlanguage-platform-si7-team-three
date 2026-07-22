import random
import smtplib
import os
from email.message import EmailMessage

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app import models
from app.auth import hash_password, verify_password


def update_profile(user_id: int, user_data, db: Session):

    db_user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()

    if db_user is None:
        return None

    db_user.full_name = user_data.full_name
    db_user.email = user_data.email

    db.commit()
    db.refresh(db_user)

    return {
        "message": "Profile updated successfully",
        "user": db_user
    }


def forgot_password(request, db: Session):

    db_user = db.query(models.User).filter(
        models.User.email == request.email
    ).first()

    if db_user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

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

AI Sign Language Platform
"""
    )

    try:
        with smtplib.SMTP(
            os.getenv("SMTP_HOST"),
            int(os.getenv("SMTP_PORT"))
        ) as smtp:

            smtp.starttls()

            smtp.login(
                os.getenv("SMTP_FROM_EMAIL"),
                os.getenv("SMTP_PASSWORD")
            )

            smtp.send_message(email)

        return {
            "message": "OTP sent successfully",
            "otp": otp
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


def change_password(request, db: Session):

    db_user = db.query(models.User).filter(
        models.User.email == request.email
    ).first()

    if db_user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if not verify_password(
        request.current_password,
        db_user.hashed_password
    ):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )

    db_user.hashed_password = hash_password(
        request.new_password
    )

    db.commit()

    return {
        "message": "Password changed successfully"
    }