from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class DepartmentBase(BaseModel):
    department_name: str
    department_code: str
    description: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(DepartmentBase):
    department_name: Optional[str] = None
    department_code: Optional[str] = None

class DepartmentInDBBase(DepartmentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class Department(DepartmentInDBBase):
    pass
