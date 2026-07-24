from typing import Optional
from datetime import date
from pydantic import BaseModel

class AcademicYearBase(BaseModel):
    academic_year: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: bool = True

class AcademicYearCreate(AcademicYearBase):
    pass

class AcademicYearUpdate(AcademicYearBase):
    academic_year: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[bool] = None

class AcademicYearInDBBase(AcademicYearBase):
    id: int

    model_config = {"from_attributes": True}

class AcademicYear(AcademicYearInDBBase):
    pass
