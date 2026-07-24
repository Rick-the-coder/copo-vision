from typing import Optional
from pydantic import BaseModel, EmailStr

class StudentBase(BaseModel):
    student_name: str
    roll_number: str
    email: EmailStr
    phone: Optional[str] = None
    department_id: int
    course_id: int
    semester_id: int
    status: bool = True

class StudentCreate(StudentBase):
    pass

class StudentUpdate(StudentBase):
    student_name: Optional[str] = None
    roll_number: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    department_id: Optional[int] = None
    course_id: Optional[int] = None
    semester_id: Optional[int] = None
    status: Optional[bool] = None

class StudentInDBBase(StudentBase):
    id: int

    model_config = {"from_attributes": True}

class Student(StudentInDBBase):
    pass
