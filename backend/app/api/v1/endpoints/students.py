from typing import Any, List
from fastapi import APIRouter, HTTPException
from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.schemas.student import Student, StudentCreate, StudentUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[Student])
def read_students(session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100) -> Any:
    return crud.student.get_multi(session, skip=skip, limit=limit)

@router.get("/{id}", response_model=Student)
def read_student(id: int, session: SessionDep, current_user: CurrentUser) -> Any:
    item = crud.student.get(session, id=id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return item

@router.post("/", response_model=Student)
def create_student(*, session: SessionDep, item_in: StudentCreate, current_user: CurrentUser) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.student.create(session, obj_in=item_in)

@router.put("/{id}", response_model=Student)
def update_student(*, session: SessionDep, id: int, item_in: StudentUpdate, current_user: CurrentUser) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    item = crud.student.get(session, id=id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.student.update(session, db_obj=item, obj_in=item_in)

@router.delete("/{id}", response_model=Student)
def delete_student(*, session: SessionDep, id: int, current_user: CurrentUser) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    item = crud.student.get(session, id=id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.student.remove(session, id=id)
