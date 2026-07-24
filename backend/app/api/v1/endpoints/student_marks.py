from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.schemas.student_mark import StudentMark, StudentMarkCreate, StudentMarkUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[StudentMark])
def read_student_marks(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return crud.student_mark.get_multi(session, skip=skip, limit=limit)

@router.post("/", response_model=StudentMark)
def create_student_mark(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    student_mark_in: StudentMarkCreate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.student_mark.create(session, obj_in=student_mark_in)

@router.put("/{id}", response_model=StudentMark)
def update_student_mark(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
    student_mark_in: StudentMarkUpdate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.student_mark.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.student_mark.update(session, db_obj=obj, obj_in=student_mark_in)

@router.delete("/{id}", response_model=StudentMark)
def delete_student_mark(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.student_mark.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.student_mark.remove(session, id=id)
