from pydantic import BaseModel, EmailStr
from typing import Optional


class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: Optional[str] = "Learner"


class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: str
    email:EmailStr