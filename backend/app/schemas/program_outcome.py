from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class ProgramOutcomeBase(BaseModel):
    po_number: str
    po_title: str
    po_description: str | None = None
    department_id: int
    status: bool = True

class ProgramOutcomeCreate(ProgramOutcomeBase):
    pass

class ProgramOutcomeUpdate(ProgramOutcomeBase):
    pass

class ProgramOutcomeInDBBase(ProgramOutcomeBase):
    id: int

    class Config:
        from_attributes = True

class ProgramOutcome(ProgramOutcomeInDBBase):
    pass
