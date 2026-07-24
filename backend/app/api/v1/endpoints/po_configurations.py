from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.schemas.po_configuration import POConfiguration, POConfigurationCreate, POConfigurationUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[POConfiguration])
def read_po_configurations(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return crud.po_configuration.get_multi(session, skip=skip, limit=limit)

@router.post("/", response_model=POConfiguration)
def create_po_configuration(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    po_configuration_in: POConfigurationCreate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.po_configuration.create(session, obj_in=po_configuration_in)

@router.put("/{id}", response_model=POConfiguration)
def update_po_configuration(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
    po_configuration_in: POConfigurationUpdate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.po_configuration.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.po_configuration.update(session, db_obj=obj, obj_in=po_configuration_in)

@router.delete("/{id}", response_model=POConfiguration)
def delete_po_configuration(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.po_configuration.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.po_configuration.remove(session, id=id)
