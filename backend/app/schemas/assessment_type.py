from typing import Optional
from datetime import datetime, date
from pydantic import BaseModel

class AssessmentTypeBase(BaseModel):
    name: str
    description: str | None = None
    status: bool = True

class AssessmentTypeCreate(AssessmentTypeBase):
    pass

class AssessmentTypeUpdate(AssessmentTypeBase):
    pass

class AssessmentTypeInDBBase(AssessmentTypeBase):
    id: int

    class Config:
        from_attributes = True

class AssessmentType(AssessmentTypeInDBBase):
    pass
