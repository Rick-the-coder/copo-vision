from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.schemas.curriculum import Curriculum, CurriculumCreate, CurriculumUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[Curriculum])
def read_curriculums(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return crud.curriculum.get_multi(session, skip=skip, limit=limit)

@router.post("/", response_model=Curriculum)
def create_curriculum(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    curriculum_in: CurriculumCreate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.curriculum.create(session, obj_in=curriculum_in)

@router.put("/{id}", response_model=Curriculum)
def update_curriculum(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
    curriculum_in: CurriculumUpdate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.curriculum.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.curriculum.update(session, db_obj=obj, obj_in=curriculum_in)

@router.delete("/{id}", response_model=Curriculum)
def delete_curriculum(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
) -> Any:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.curriculum.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.curriculum.remove(session, id=id)
