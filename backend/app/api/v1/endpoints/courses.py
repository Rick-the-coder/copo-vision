from typing import Any, List
from fastapi import APIRouter, HTTPException
from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.schemas.course import Course, CourseCreate, CourseUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[Course])
def read_courses(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return crud.course.get_multi(session, skip=skip, limit=limit)

@router.get("/{id}", response_model=Course)
def read_course(
    id: int,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    course = crud.course.get(session, id=id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.post("/", response_model=Course)
def create_course(
    *,
    session: SessionDep,
    course_in: CourseCreate,
    current_user: CurrentUser,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.course.create(session, obj_in=course_in)

@router.put("/{id}", response_model=Course)
def update_course(
    *,
    session: SessionDep,
    id: int,
    course_in: CourseUpdate,
    current_user: CurrentUser,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    course = crud.course.get(session, id=id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return crud.course.update(session, db_obj=course, obj_in=course_in)

@router.delete("/{id}", response_model=Course)
def delete_course(
    *,
    session: SessionDep,
    id: int,
    current_user: CurrentUser,
) -> Any:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    course = crud.course.get(session, id=id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return crud.course.remove(session, id=id)
