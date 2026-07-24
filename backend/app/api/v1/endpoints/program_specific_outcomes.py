from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.schemas.program_specific_outcome import ProgramSpecificOutcome, ProgramSpecificOutcomeCreate, ProgramSpecificOutcomeUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[ProgramSpecificOutcome])
def read_program_specific_outcomes(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return crud.program_specific_outcome.get_multi(session, skip=skip, limit=limit)

@router.post("/", response_model=ProgramSpecificOutcome)
def create_program_specific_outcome(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    program_specific_outcome_in: ProgramSpecificOutcomeCreate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.program_specific_outcome.create(session, obj_in=program_specific_outcome_in)

@router.put("/{id}", response_model=ProgramSpecificOutcome)
def update_program_specific_outcome(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
    program_specific_outcome_in: ProgramSpecificOutcomeUpdate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.program_specific_outcome.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.program_specific_outcome.update(session, db_obj=obj, obj_in=program_specific_outcome_in)

@router.delete("/{id}", response_model=ProgramSpecificOutcome)
def delete_program_specific_outcome(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.program_specific_outcome.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.program_specific_outcome.remove(session, id=id)
