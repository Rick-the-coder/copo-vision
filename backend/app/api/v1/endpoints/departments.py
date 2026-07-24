from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.schemas.department import Department, DepartmentCreate, DepartmentUpdate
from app.models.user import UserRole
from app.crud.base import CRUDBase
from app.models.department import Department as DepartmentModel

router = APIRouter()
crud_department = CRUDBase[DepartmentModel, DepartmentCreate, DepartmentUpdate](DepartmentModel)

@router.get("/", response_model=List[Department])
def read_departments(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve departments.
    """
    departments = crud_department.get_multi(session, skip=skip, limit=limit)
    return departments

@router.post("/", response_model=Department)
def create_department(
    *,
    session: SessionDep,
    department_in: DepartmentCreate,
    current_user: CurrentUser,
) -> Any:
    """
    Create new department. Only Admin can create.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Check if department exists by code
    existing = session.query(DepartmentModel).filter(DepartmentModel.department_code == department_in.department_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department with this code already exists")
        
    department = crud_department.create(session, obj_in=department_in)
    return department
