from typing import Any, List
from fastapi import APIRouter, HTTPException
from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.schemas.semester import Semester, SemesterCreate, SemesterUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[Semester])
def read_semesters(session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100) -> Any:
    return crud.semester.get_multi(session, skip=skip, limit=limit)

@router.get("/{id}", response_model=Semester)
def read_semester(id: int, session: SessionDep, current_user: CurrentUser) -> Any:
    item = crud.semester.get(session, id=id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return item

@router.post("/", response_model=Semester)
def create_semester(*, session: SessionDep, item_in: SemesterCreate, current_user: CurrentUser) -> Any:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.semester.create(session, obj_in=item_in)

@router.put("/{id}", response_model=Semester)
def update_semester(*, session: SessionDep, id: int, item_in: SemesterUpdate, current_user: CurrentUser) -> Any:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    item = crud.semester.get(session, id=id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.semester.update(session, db_obj=item, obj_in=item_in)

@router.delete("/{id}", response_model=Semester)
def delete_semester(*, session: SessionDep, id: int, current_user: CurrentUser) -> Any:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    item = crud.semester.get(session, id=id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.semester.remove(session, id=id)
