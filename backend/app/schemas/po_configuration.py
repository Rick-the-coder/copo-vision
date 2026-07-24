from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class POConfigurationBase(BaseModel):
    target_percentage: float = 70.0
    correlation_scale: int = 3
    calculation_method: str = 'Weighted Average'
    attainment_levels: str = 'Level 1, Level 2, Level 3'
    passing_rules: str = 'Strict'
    status: bool = True

class POConfigurationCreate(POConfigurationBase):
    pass

class POConfigurationUpdate(POConfigurationBase):
    pass

class POConfigurationInDBBase(POConfigurationBase):
    id: int

    class Config:
        from_attributes = True

class POConfiguration(POConfigurationInDBBase):
    pass
