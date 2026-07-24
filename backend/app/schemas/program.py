from typing import Optional
from datetime import datetime, date
from pydantic import BaseModel

class ProgramBase(BaseModel):
    program_name: str
    program_code: str
    department_id: int
    duration: int
    degree_type: str
    status: bool = True

class ProgramCreate(ProgramBase):
    pass

class ProgramUpdate(ProgramBase):
    pass

class ProgramInDBBase(ProgramBase):
    id: int

    class Config:
        from_attributes = True

class Program(ProgramInDBBase):
    pass
