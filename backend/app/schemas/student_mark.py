from typing import Optional
from datetime import datetime, date
from pydantic import BaseModel

class StudentMarkBase(BaseModel):
    student_id: int
    assessment_id: int
    question_id: int | None = None
    marks_obtained: float
    remarks: str | None = None
    attendance_status: str = 'Present'
    is_final_submission: bool = False

class StudentMarkCreate(StudentMarkBase):
    pass

class StudentMarkUpdate(StudentMarkBase):
    pass

class StudentMarkInDBBase(StudentMarkBase):
    id: int

    class Config:
        from_attributes = True

class StudentMark(StudentMarkInDBBase):
    pass
