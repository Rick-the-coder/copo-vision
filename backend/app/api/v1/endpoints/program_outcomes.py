from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.schemas.program_outcome import ProgramOutcome, ProgramOutcomeCreate, ProgramOutcomeUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[ProgramOutcome])
def read_program_outcomes(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return crud.program_outcome.get_multi(session, skip=skip, limit=limit)

@router.post("/", response_model=ProgramOutcome)
def create_program_outcome(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    program_outcome_in: ProgramOutcomeCreate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.program_outcome.create(session, obj_in=program_outcome_in)

@router.put("/{id}", response_model=ProgramOutcome)
def update_program_outcome(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
    program_outcome_in: ProgramOutcomeUpdate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.program_outcome.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.program_outcome.update(session, db_obj=obj, obj_in=program_outcome_in)

@router.delete("/{id}", response_model=ProgramOutcome)
def delete_program_outcome(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.program_outcome.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.program_outcome.remove(session, id=id)
