from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.schemas.co_attainment_history import COAttainmentHistory, COAttainmentHistoryCreate, COAttainmentHistoryUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[COAttainmentHistory])
def read_co_attainment_historys(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return crud.co_attainment_history.get_multi(session, skip=skip, limit=limit)

@router.post("/", response_model=COAttainmentHistory)
def create_co_attainment_history(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    co_attainment_history_in: COAttainmentHistoryCreate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.co_attainment_history.create(session, obj_in=co_attainment_history_in)

@router.put("/{id}", response_model=COAttainmentHistory)
def update_co_attainment_history(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
    co_attainment_history_in: COAttainmentHistoryUpdate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.co_attainment_history.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.co_attainment_history.update(session, db_obj=obj, obj_in=co_attainment_history_in)

@router.delete("/{id}", response_model=COAttainmentHistory)
def delete_co_attainment_history(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.co_attainment_history.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.co_attainment_history.remove(session, id=id)
