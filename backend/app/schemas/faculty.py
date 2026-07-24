from typing import Optional
from pydantic import BaseModel, EmailStr

class FacultyBase(BaseModel):
    faculty_name: str
    email: EmailStr
    phone: Optional[str] = None
    designation: Optional[str] = None
    department_id: int
    status: bool = True

class FacultyCreate(FacultyBase):
    pass

class FacultyUpdate(FacultyBase):
    faculty_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    designation: Optional[str] = None
    department_id: Optional[int] = None
    status: Optional[bool] = None

class FacultyInDBBase(FacultyBase):
    id: int

    model_config = {"from_attributes": True}

class Faculty(FacultyInDBBase):
    pass
