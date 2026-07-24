from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.schemas.program import Program, ProgramCreate, ProgramUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[Program])
def read_programs(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return crud.program.get_multi(session, skip=skip, limit=limit)

@router.post("/", response_model=Program)
def create_program(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    program_in: ProgramCreate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.program.create(session, obj_in=program_in)

@router.put("/{id}", response_model=Program)
def update_program(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
    program_in: ProgramUpdate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.program.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.program.update(session, db_obj=obj, obj_in=program_in)

@router.delete("/{id}", response_model=Program)
def delete_program(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
) -> Any:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.program.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.program.remove(session, id=id)
