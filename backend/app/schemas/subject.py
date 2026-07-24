from typing import Optional
from pydantic import BaseModel

class SubjectBase(BaseModel):
    subject_name: str
    subject_code: str
    semester: int
    credits: int
    course_id: int
    faculty_id: Optional[int] = None
    status: bool = True

class SubjectCreate(SubjectBase):
    pass

class SubjectUpdate(SubjectBase):
    subject_name: Optional[str] = None
    subject_code: Optional[str] = None
    semester: Optional[int] = None
    credits: Optional[int] = None
    course_id: Optional[int] = None
    faculty_id: Optional[int] = None
    status: Optional[bool] = None

class SubjectInDBBase(SubjectBase):
    id: int

    model_config = {"from_attributes": True}

class Subject(SubjectInDBBase):
    pass
