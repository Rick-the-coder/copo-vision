from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class POAttainmentHistoryBase(BaseModel):
    batch_id: str
    course_id: int
    calculated_by: int
    notes: str | None = None

class POAttainmentHistoryCreate(POAttainmentHistoryBase):
    pass

class POAttainmentHistoryUpdate(POAttainmentHistoryBase):
    pass

class POAttainmentHistoryInDBBase(POAttainmentHistoryBase):
    id: int

    class Config:
        from_attributes = True

class POAttainmentHistory(POAttainmentHistoryInDBBase):
    pass
