from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class POAttainmentBase(BaseModel):
    student_id: int
    course_id: int
    po_id: int | None = None
    pso_id: int | None = None
    achieved_percentage: float
    attainment_level: int = 0

class POAttainmentCreate(POAttainmentBase):
    pass

class POAttainmentUpdate(POAttainmentBase):
    pass

class POAttainmentInDBBase(POAttainmentBase):
    id: int

    class Config:
        from_attributes = True

class POAttainment(POAttainmentInDBBase):
    pass
