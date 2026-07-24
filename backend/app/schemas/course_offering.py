from typing import Optional
from datetime import datetime, date
from pydantic import BaseModel

class CourseOfferingBase(BaseModel):
    course_id: int
    faculty_id: int
    semester_id: int
    section_id: int
    academic_year_id: int
    status: bool = True

class CourseOfferingCreate(CourseOfferingBase):
    pass

class CourseOfferingUpdate(CourseOfferingBase):
    pass

class CourseOfferingInDBBase(CourseOfferingBase):
    id: int

    class Config:
        from_attributes = True

class CourseOffering(CourseOfferingInDBBase):
    pass
