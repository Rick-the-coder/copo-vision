from typing import Optional
from datetime import datetime, date
from pydantic import BaseModel

class AuditLogBase(BaseModel):
    user_id: int
    action: str
    entity_type: str
    entity_id: int | None = None

class AuditLogCreate(AuditLogBase):
    pass

class AuditLogUpdate(AuditLogBase):
    pass

class AuditLogInDBBase(AuditLogBase):
    id: int

    class Config:
        from_attributes = True

class AuditLog(AuditLogInDBBase):
    pass
