from typing import Any, List
from fastapi import APIRouter, HTTPException
from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.schemas.subject import Subject, SubjectCreate, SubjectUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[Subject])
def read_subjects(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    return crud.subject.get_multi(session, skip=skip, limit=limit)

@router.get("/{id}", response_model=Subject)
def read_subject(id: int, session: SessionDep, current_user: CurrentUser) -> Any:
    item = crud.subject.get(session, id=id)
    if not item:
        raise HTTPException(status_code=404, detail="Subject not found")
    return item

@router.post("/", response_model=Subject)
def create_subject(*, session: SessionDep, item_in: SubjectCreate, current_user: CurrentUser) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.subject.create(session, obj_in=item_in)

@router.put("/{id}", response_model=Subject)
def update_subject(*, session: SessionDep, id: int, item_in: SubjectUpdate, current_user: CurrentUser) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    item = crud.subject.get(session, id=id)
    if not item:
        raise HTTPException(status_code=404, detail="Subject not found")
    return crud.subject.update(session, db_obj=item, obj_in=item_in)

@router.delete("/{id}", response_model=Subject)
def delete_subject(*, session: SessionDep, id: int, current_user: CurrentUser) -> Any:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    item = crud.subject.get(session, id=id)
    if not item:
        raise HTTPException(status_code=404, detail="Subject not found")
    return crud.subject.remove(session, id=id)
