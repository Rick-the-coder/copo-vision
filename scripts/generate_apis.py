import os

modules = [
    {
        "name": "co_configuration",
        "class_name": "COConfiguration",
        "base_fields": [
            "target_percentage: float = 60.0",
            "calculation_method: str = 'Average'",
            "round_off_rules: str = 'Standard'",
            "minimum_student_count: int = 5",
            "status: bool = True"
        ]
    },
    {
        "name": "attainment_rule",
        "class_name": "AttainmentRule",
        "base_fields": [
            "level_name: str",
            "min_percentage: float",
            "max_percentage: float",
            "status: bool = True"
        ]
    },
    {
        "name": "assessment_weightage",
        "class_name": "AssessmentWeightage",
        "base_fields": [
            "assessment_type_id: int",
            "course_id: int",
            "weightage_percentage: float",
            "is_active: bool = True"
        ]
    },
    {
        "name": "co_attainment",
        "class_name": "COAttainment",
        "base_fields": [
            "student_id: int",
            "course_id: int",
            "co_id: int",
            "assessment_id: int | None = None",
            "attainment_percentage: float",
            "attainment_level: str",
            "academic_year: str",
            "semester: str"
        ]
    },
    {
        "name": "co_attainment_history",
        "class_name": "COAttainmentHistory",
        "base_fields": [
            "co_attainment_id: int",
            "previous_percentage: float | None = None",
            "new_percentage: float",
            "calculated_by: int | None = None"
        ]
    }
]

schema_template = """from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class {class_name}Base(BaseModel):
{base_fields_str}

class {class_name}Create({class_name}Base):
    pass

class {class_name}Update({class_name}Base):
    pass

class {class_name}InDBBase({class_name}Base):
    id: int

    class Config:
        from_attributes = True

class {class_name}({class_name}InDBBase):
    pass
"""

crud_template = """from app.crud.base import CRUDBase
from app.models.{name} import {class_name}
from app.schemas.{name} import {class_name}Create, {class_name}Update

class CRUD{class_name}(CRUDBase[{class_name}, {class_name}Create, {class_name}Update]):
    pass

{name} = CRUD{class_name}({class_name})
"""

endpoint_template = """from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.schemas.{name} import {class_name}, {class_name}Create, {class_name}Update
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[{class_name}])
def read_{name}s(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return crud.{name}.get_multi(session, skip=skip, limit=limit)

@router.post("/", response_model={class_name})
def create_{name}(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    {name}_in: {class_name}Create,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.{name}.create(session, obj_in={name}_in)

@router.put("/{{id}}", response_model={class_name})
def update_{name}(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
    {name}_in: {class_name}Update,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.{name}.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.{name}.update(session, db_obj=obj, obj_in={name}_in)

@router.delete("/{{id}}", response_model={class_name})
def delete_{name}(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.{name}.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.{name}.remove(session, id=id)
"""

base_dir = "/Users/shaileshbujade/COPO Vision- Predictive Analytics Platform for NBA Outcome Attainment  /backend/app"

for mod in modules:
    # 1. Schemas
    base_fields_str = "\n".join([f"    {f}" for f in mod["base_fields"]])
    with open(os.path.join(base_dir, "schemas", f"{mod['name']}.py"), "w") as f:
        f.write(schema_template.format(class_name=mod["class_name"], base_fields_str=base_fields_str))
    
    # 2. CRUD
    crud_file = os.path.join(base_dir, "crud", f"crud_{mod['name']}.py")
    with open(crud_file, "w") as f:
        f.write(crud_template.format(name=mod["name"], class_name=mod["class_name"]))
    
    # Update crud/__init__.py
    with open(os.path.join(base_dir, "crud", "__init__.py"), "a") as f:
        f.write(f"from .crud_{mod['name']} import {mod['name']}\n")

    # 3. Endpoints
    with open(os.path.join(base_dir, "api", "v1", "endpoints", f"{mod['name']}s.py"), "w") as f:
        f.write(endpoint_template.format(name=mod["name"], class_name=mod["class_name"]))

print("Generated Phase 4 API modules.")
