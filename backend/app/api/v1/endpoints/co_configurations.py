from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.schemas.co_configuration import COConfiguration, COConfigurationCreate, COConfigurationUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[COConfiguration])
def read_co_configurations(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return crud.co_configuration.get_multi(session, skip=skip, limit=limit)

@router.post("/", response_model=COConfiguration)
def create_co_configuration(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    co_configuration_in: COConfigurationCreate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.co_configuration.create(session, obj_in=co_configuration_in)

@router.put("/{id}", response_model=COConfiguration)
def update_co_configuration(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
    co_configuration_in: COConfigurationUpdate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.co_configuration.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.co_configuration.update(session, db_obj=obj, obj_in=co_configuration_in)

@router.delete("/{id}", response_model=COConfiguration)
def delete_co_configuration(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.co_configuration.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.co_configuration.remove(session, id=id)
