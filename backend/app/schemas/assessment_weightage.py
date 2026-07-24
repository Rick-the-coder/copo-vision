from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class AssessmentWeightageBase(BaseModel):
    assessment_type_id: int
    course_id: int
    weightage_percentage: float
    is_active: bool = True

class AssessmentWeightageCreate(AssessmentWeightageBase):
    pass

class AssessmentWeightageUpdate(AssessmentWeightageBase):
    pass

class AssessmentWeightageInDBBase(AssessmentWeightageBase):
    id: int

    class Config:
        from_attributes = True

class AssessmentWeightage(AssessmentWeightageInDBBase):
    pass
