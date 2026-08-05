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

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str  

class ChangePasswordRequest(BaseModel):
    email: EmailStr
    current_password: str
    new_password: str
    
class AssignStudentRequest(BaseModel):
    instructor_id: int
    student_id: int    

class BulkStatusUpdateRequest(BaseModel):
    user_ids: list[int]
    is_active: bool    