from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.schemas.course_offering import CourseOffering, CourseOfferingCreate, CourseOfferingUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[CourseOffering])
def read_course_offerings(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return crud.course_offering.get_multi(session, skip=skip, limit=limit)

@router.post("/", response_model=CourseOffering)
def create_course_offering(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    course_offering_in: CourseOfferingCreate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.course_offering.create(session, obj_in=course_offering_in)

@router.put("/{id}", response_model=CourseOffering)
def update_course_offering(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
    course_offering_in: CourseOfferingUpdate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.course_offering.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.course_offering.update(session, db_obj=obj, obj_in=course_offering_in)

@router.delete("/{id}", response_model=CourseOffering)
def delete_course_offering(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
) -> Any:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.course_offering.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.course_offering.remove(session, id=id)
