from typing import Optional
from datetime import datetime, date
from pydantic import BaseModel

class CurriculumBase(BaseModel):
    curriculum_name: str
    version: str
    department_id: int
    program_id: int
    status: bool = True
    courses_included: list = []

class CurriculumCreate(CurriculumBase):
    pass

class CurriculumUpdate(CurriculumBase):
    pass

class CurriculumInDBBase(CurriculumBase):
    id: int

    class Config:
        from_attributes = True

class Curriculum(CurriculumInDBBase):
    pass
