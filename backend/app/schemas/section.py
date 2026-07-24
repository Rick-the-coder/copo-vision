from typing import Optional
from datetime import datetime, date
from pydantic import BaseModel

class SectionBase(BaseModel):
    section_name: str
    batch_id: int
    semester_id: int | None = None
    mentor_faculty_id: int | None = None
    status: bool = True

class SectionCreate(SectionBase):
    pass

class SectionUpdate(SectionBase):
    pass

class SectionInDBBase(SectionBase):
    id: int

    class Config:
        from_attributes = True

class Section(SectionInDBBase):
    pass
