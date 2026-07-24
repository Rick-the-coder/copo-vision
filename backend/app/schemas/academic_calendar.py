from typing import Optional
from datetime import datetime, date
from pydantic import BaseModel

class AcademicCalendarBase(BaseModel):
    academic_year_id: int
    semester_id: int
    internal_exam_dates: list = []
    practical_dates: list = []
    assignment_deadlines: list = []
    holiday_list: list = []

class AcademicCalendarCreate(AcademicCalendarBase):
    pass

class AcademicCalendarUpdate(AcademicCalendarBase):
    pass

class AcademicCalendarInDBBase(AcademicCalendarBase):
    id: int

    class Config:
        from_attributes = True

class AcademicCalendar(AcademicCalendarInDBBase):
    pass
