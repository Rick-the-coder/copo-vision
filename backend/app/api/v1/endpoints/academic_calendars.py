from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.schemas.academic_calendar import AcademicCalendar, AcademicCalendarCreate, AcademicCalendarUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[AcademicCalendar])
def read_academic_calendars(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return crud.academic_calendar.get_multi(session, skip=skip, limit=limit)

@router.post("/", response_model=AcademicCalendar)
def create_academic_calendar(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    academic_calendar_in: AcademicCalendarCreate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.academic_calendar.create(session, obj_in=academic_calendar_in)

@router.put("/{id}", response_model=AcademicCalendar)
def update_academic_calendar(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
    academic_calendar_in: AcademicCalendarUpdate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.academic_calendar.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.academic_calendar.update(session, db_obj=obj, obj_in=academic_calendar_in)

@router.delete("/{id}", response_model=AcademicCalendar)
def delete_academic_calendar(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
) -> Any:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.academic_calendar.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.academic_calendar.remove(session, id=id)
