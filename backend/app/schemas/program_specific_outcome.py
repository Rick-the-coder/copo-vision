from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class ProgramSpecificOutcomeBase(BaseModel):
    pso_number: str
    pso_title: str
    pso_description: str | None = None
    department_id: int
    status: bool = True

class ProgramSpecificOutcomeCreate(ProgramSpecificOutcomeBase):
    pass

class ProgramSpecificOutcomeUpdate(ProgramSpecificOutcomeBase):
    pass

class ProgramSpecificOutcomeInDBBase(ProgramSpecificOutcomeBase):
    id: int

    class Config:
        from_attributes = True

class ProgramSpecificOutcome(ProgramSpecificOutcomeInDBBase):
    pass
