from typing import Optional
from pydantic import BaseModel

class SemesterBase(BaseModel):
    semester_number: int
    academic_year_id: int
    status: bool = True

class SemesterCreate(SemesterBase):
    pass

class SemesterUpdate(SemesterBase):
    semester_number: Optional[int] = None
    academic_year_id: Optional[int] = None
    status: Optional[bool] = None

class SemesterInDBBase(SemesterBase):
    id: int

    model_config = {"from_attributes": True}

class Semester(SemesterInDBBase):
    pass
