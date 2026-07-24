from typing import Optional
from datetime import datetime, date
from pydantic import BaseModel

class BatchBase(BaseModel):
    batch_name: str
    batch_year: int
    program_id: int
    academic_year_id: int
    status: bool = True

class BatchCreate(BatchBase):
    pass

class BatchUpdate(BatchBase):
    pass

class BatchInDBBase(BatchBase):
    id: int

    class Config:
        from_attributes = True

class Batch(BatchInDBBase):
    pass
