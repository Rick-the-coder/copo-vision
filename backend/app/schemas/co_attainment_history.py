from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class COAttainmentHistoryBase(BaseModel):
    co_attainment_id: int
    previous_percentage: float | None = None
    new_percentage: float
    calculated_by: int | None = None

class COAttainmentHistoryCreate(COAttainmentHistoryBase):
    pass

class COAttainmentHistoryUpdate(COAttainmentHistoryBase):
    pass

class COAttainmentHistoryInDBBase(COAttainmentHistoryBase):
    id: int

    class Config:
        from_attributes = True

class COAttainmentHistory(COAttainmentHistoryInDBBase):
    pass
