from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.schemas.assessment import Assessment, AssessmentCreate, AssessmentUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[Assessment])
def read_assessments(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return crud.assessment.get_multi(session, skip=skip, limit=limit)

@router.post("/", response_model=Assessment)
def create_assessment(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    assessment_in: AssessmentCreate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.assessment.create(session, obj_in=assessment_in)

@router.put("/{id}", response_model=Assessment)
def update_assessment(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
    assessment_in: AssessmentUpdate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.assessment.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.assessment.update(session, db_obj=obj, obj_in=assessment_in)

@router.delete("/{id}", response_model=Assessment)
def delete_assessment(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.assessment.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.assessment.remove(session, id=id)
