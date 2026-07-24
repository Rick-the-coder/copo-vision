from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class COAttainmentBase(BaseModel):
    student_id: int
    course_id: int
    co_id: int
    assessment_id: int | None = None
    attainment_percentage: float
    attainment_level: str
    academic_year: str
    semester: str

class COAttainmentCreate(COAttainmentBase):
    pass

class COAttainmentUpdate(COAttainmentBase):
    pass

class COAttainmentInDBBase(COAttainmentBase):
    id: int

    class Config:
        from_attributes = True

class COAttainment(COAttainmentInDBBase):
    pass
