from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.schemas.assessment_weightage import AssessmentWeightage, AssessmentWeightageCreate, AssessmentWeightageUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[AssessmentWeightage])
def read_assessment_weightages(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return crud.assessment_weightage.get_multi(session, skip=skip, limit=limit)

@router.post("/", response_model=AssessmentWeightage)
def create_assessment_weightage(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    assessment_weightage_in: AssessmentWeightageCreate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.assessment_weightage.create(session, obj_in=assessment_weightage_in)

@router.put("/{id}", response_model=AssessmentWeightage)
def update_assessment_weightage(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
    assessment_weightage_in: AssessmentWeightageUpdate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.assessment_weightage.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.assessment_weightage.update(session, db_obj=obj, obj_in=assessment_weightage_in)

@router.delete("/{id}", response_model=AssessmentWeightage)
def delete_assessment_weightage(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.assessment_weightage.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.assessment_weightage.remove(session, id=id)
