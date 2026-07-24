from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.schemas.assessment_type import AssessmentType, AssessmentTypeCreate, AssessmentTypeUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[AssessmentType])
def read_assessment_types(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return crud.assessment_type.get_multi(session, skip=skip, limit=limit)

@router.post("/", response_model=AssessmentType)
def create_assessment_type(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    assessment_type_in: AssessmentTypeCreate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.assessment_type.create(session, obj_in=assessment_type_in)

@router.put("/{id}", response_model=AssessmentType)
def update_assessment_type(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
    assessment_type_in: AssessmentTypeUpdate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.assessment_type.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.assessment_type.update(session, db_obj=obj, obj_in=assessment_type_in)

@router.delete("/{id}", response_model=AssessmentType)
def delete_assessment_type(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.assessment_type.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.assessment_type.remove(session, id=id)
