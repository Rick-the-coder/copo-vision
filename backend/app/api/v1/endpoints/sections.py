from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.schemas.section import Section, SectionCreate, SectionUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[Section])
def read_sections(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return crud.section.get_multi(session, skip=skip, limit=limit)

@router.post("/", response_model=Section)
def create_section(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    section_in: SectionCreate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.section.create(session, obj_in=section_in)

@router.put("/{id}", response_model=Section)
def update_section(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
    section_in: SectionUpdate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.section.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.section.update(session, db_obj=obj, obj_in=section_in)

@router.delete("/{id}", response_model=Section)
def delete_section(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
) -> Any:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.section.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.section.remove(session, id=id)
