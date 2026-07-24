from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.schemas.batch import Batch, BatchCreate, BatchUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[Batch])
def read_batchs(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return crud.batch.get_multi(session, skip=skip, limit=limit)

@router.post("/", response_model=Batch)
def create_batch(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    batch_in: BatchCreate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.batch.create(session, obj_in=batch_in)

@router.put("/{id}", response_model=Batch)
def update_batch(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
    batch_in: BatchUpdate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.batch.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.batch.update(session, db_obj=obj, obj_in=batch_in)

@router.delete("/{id}", response_model=Batch)
def delete_batch(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
) -> Any:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.batch.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.batch.remove(session, id=id)
