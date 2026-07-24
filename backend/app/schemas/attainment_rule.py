from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class AttainmentRuleBase(BaseModel):
    level_name: str
    min_percentage: float
    max_percentage: float
    status: bool = True

class AttainmentRuleCreate(AttainmentRuleBase):
    pass

class AttainmentRuleUpdate(AttainmentRuleBase):
    pass

class AttainmentRuleInDBBase(AttainmentRuleBase):
    id: int

    class Config:
        from_attributes = True

class AttainmentRule(AttainmentRuleInDBBase):
    pass
