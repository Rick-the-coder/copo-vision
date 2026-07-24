from typing import Any, List
from fastapi import APIRouter, HTTPException
from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.schemas.faculty import Faculty, FacultyCreate, FacultyUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[Faculty])
def read_faculties(session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100) -> Any:
    return crud.faculty.get_multi(session, skip=skip, limit=limit)

@router.get("/{id}", response_model=Faculty)
def read_faculty(id: int, session: SessionDep, current_user: CurrentUser) -> Any:
    item = crud.faculty.get(session, id=id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return item

@router.post("/", response_model=Faculty)
def create_faculty(*, session: SessionDep, item_in: FacultyCreate, current_user: CurrentUser) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.faculty.create(session, obj_in=item_in)

@router.put("/{id}", response_model=Faculty)
def update_faculty(*, session: SessionDep, id: int, item_in: FacultyUpdate, current_user: CurrentUser) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    item = crud.faculty.get(session, id=id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.faculty.update(session, db_obj=item, obj_in=item_in)

@router.delete("/{id}", response_model=Faculty)
def delete_faculty(*, session: SessionDep, id: int, current_user: CurrentUser) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    item = crud.faculty.get(session, id=id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.faculty.remove(session, id=id)
