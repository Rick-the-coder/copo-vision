from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.schemas.po_attainment import POAttainment, POAttainmentCreate, POAttainmentUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[POAttainment])
def read_po_attainments(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return crud.po_attainment.get_multi(session, skip=skip, limit=limit)

@router.post("/", response_model=POAttainment)
def create_po_attainment(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    po_attainment_in: POAttainmentCreate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.po_attainment.create(session, obj_in=po_attainment_in)

@router.put("/{id}", response_model=POAttainment)
def update_po_attainment(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
    po_attainment_in: POAttainmentUpdate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.po_attainment.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.po_attainment.update(session, db_obj=obj, obj_in=po_attainment_in)

@router.delete("/{id}", response_model=POAttainment)
def delete_po_attainment(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.po_attainment.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.po_attainment.remove(session, id=id)
