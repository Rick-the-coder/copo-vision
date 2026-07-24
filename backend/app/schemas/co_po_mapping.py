from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class COPOMappingBase(BaseModel):
    course_id: int
    co_id: int
    po_id: int | None = None
    pso_id: int | None = None
    correlation_level: int = 0

class COPOMappingCreate(COPOMappingBase):
    pass

class COPOMappingUpdate(COPOMappingBase):
    pass

class COPOMappingInDBBase(COPOMappingBase):
    id: int

    class Config:
        from_attributes = True

class COPOMapping(COPOMappingInDBBase):
    pass
