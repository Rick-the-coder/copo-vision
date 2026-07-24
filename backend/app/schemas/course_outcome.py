from typing import Optional
from datetime import datetime, date
from pydantic import BaseModel

class CourseOutcomeBase(BaseModel):
    course_id: int
    co_number: str
    co_title: str
    co_description: str
    target_percentage: float
    status: bool = True

class CourseOutcomeCreate(CourseOutcomeBase):
    pass

class CourseOutcomeUpdate(CourseOutcomeBase):
    pass

class CourseOutcomeInDBBase(CourseOutcomeBase):
    id: int

    class Config:
        from_attributes = True

class CourseOutcome(CourseOutcomeInDBBase):
    pass
