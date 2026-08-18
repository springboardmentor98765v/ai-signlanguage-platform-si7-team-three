from pydantic import BaseModel, EmailStr , Field
from typing import Optional , Annotated


class UserRegister(BaseModel):
    full_name: str = Field(min_length=1)
    email: EmailStr
    password: str = Field(min_length=8)
    role: Optional[str] = "Learner"


class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: str = Field(min_length=1)
    email:EmailStr

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    current_password:str
    new_password: str  = Field(min_length=8) 

class ChangePasswordRequest(BaseModel):
    email: EmailStr
    current_password: str
    new_password: str
    
class AssignStudentRequest(BaseModel):
    instructor_id: int = Field(gt=0)
    student_id: int = Field(gt=0)   

class BulkStatusUpdateRequest(BaseModel):
    user_ids: list[Annotated[int, Field(gt=0)]] = Field(min_length=1)
    is_active: bool 