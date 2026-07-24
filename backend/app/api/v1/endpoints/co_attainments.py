from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.schemas.co_attainment import COAttainment, COAttainmentCreate, COAttainmentUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[COAttainment])
def read_co_attainments(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return crud.co_attainment.get_multi(session, skip=skip, limit=limit)

@router.post("/", response_model=COAttainment)
def create_co_attainment(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    co_attainment_in: COAttainmentCreate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.co_attainment.create(session, obj_in=co_attainment_in)

@router.put("/{id}", response_model=COAttainment)
def update_co_attainment(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
    co_attainment_in: COAttainmentUpdate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.co_attainment.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.co_attainment.update(session, db_obj=obj, obj_in=co_attainment_in)

@router.delete("/{id}", response_model=COAttainment)
def delete_co_attainment(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.co_attainment.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.co_attainment.remove(session, id=id)
