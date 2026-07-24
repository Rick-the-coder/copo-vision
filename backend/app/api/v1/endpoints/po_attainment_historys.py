from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.schemas.po_attainment_history import POAttainmentHistory, POAttainmentHistoryCreate, POAttainmentHistoryUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[POAttainmentHistory])
def read_po_attainment_historys(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return crud.po_attainment_history.get_multi(session, skip=skip, limit=limit)

@router.post("/", response_model=POAttainmentHistory)
def create_po_attainment_history(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    po_attainment_history_in: POAttainmentHistoryCreate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.po_attainment_history.create(session, obj_in=po_attainment_history_in)

@router.put("/{id}", response_model=POAttainmentHistory)
def update_po_attainment_history(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
    po_attainment_history_in: POAttainmentHistoryUpdate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.po_attainment_history.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.po_attainment_history.update(session, db_obj=obj, obj_in=po_attainment_history_in)

@router.delete("/{id}", response_model=POAttainmentHistory)
def delete_po_attainment_history(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.po_attainment_history.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.po_attainment_history.remove(session, id=id)
