from typing import Optional
from datetime import datetime, date
from pydantic import BaseModel

class AssessmentBase(BaseModel):
    assessment_name: str
    assessment_type_id: int
    course_id: int
    semester_id: int
    academic_year_id: int
    faculty_id: int
    maximum_marks: float
    passing_marks: float
    weightage: float
    schedule_date: date | None = None
    status: bool = True

class AssessmentCreate(AssessmentBase):
    pass

class AssessmentUpdate(AssessmentBase):
    pass

class AssessmentInDBBase(AssessmentBase):
    id: int

    class Config:
        from_attributes = True

class Assessment(AssessmentInDBBase):
    pass
