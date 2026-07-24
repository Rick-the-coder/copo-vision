from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.schemas.co_po_mapping import COPOMapping, COPOMappingCreate, COPOMappingUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[COPOMapping])
def read_co_po_mappings(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return crud.co_po_mapping.get_multi(session, skip=skip, limit=limit)

@router.post("/", response_model=COPOMapping)
def create_co_po_mapping(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    co_po_mapping_in: COPOMappingCreate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.co_po_mapping.create(session, obj_in=co_po_mapping_in)

@router.put("/{id}", response_model=COPOMapping)
def update_co_po_mapping(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
    co_po_mapping_in: COPOMappingUpdate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.co_po_mapping.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.co_po_mapping.update(session, db_obj=obj, obj_in=co_po_mapping_in)

@router.delete("/{id}", response_model=COPOMapping)
def delete_co_po_mapping(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.co_po_mapping.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.co_po_mapping.remove(session, id=id)
