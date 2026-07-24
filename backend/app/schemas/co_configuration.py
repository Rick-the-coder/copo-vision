from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class COConfigurationBase(BaseModel):
    target_percentage: float = 60.0
    calculation_method: str = 'Average'
    round_off_rules: str = 'Standard'
    minimum_student_count: int = 5
    status: bool = True

class COConfigurationCreate(COConfigurationBase):
    pass

class COConfigurationUpdate(COConfigurationBase):
    pass

class COConfigurationInDBBase(COConfigurationBase):
    id: int

    class Config:
        from_attributes = True

class COConfiguration(COConfigurationInDBBase):
    pass
