from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.schemas.course_outcome import CourseOutcome, CourseOutcomeCreate, CourseOutcomeUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[CourseOutcome])
def read_course_outcomes(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return crud.course_outcome.get_multi(session, skip=skip, limit=limit)

@router.post("/", response_model=CourseOutcome)
def create_course_outcome(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    course_outcome_in: CourseOutcomeCreate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.course_outcome.create(session, obj_in=course_outcome_in)

@router.put("/{id}", response_model=CourseOutcome)
def update_course_outcome(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
    course_outcome_in: CourseOutcomeUpdate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.course_outcome.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.course_outcome.update(session, db_obj=obj, obj_in=course_outcome_in)

@router.delete("/{id}", response_model=CourseOutcome)
def delete_course_outcome(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.course_outcome.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.course_outcome.remove(session, id=id)
