from typing import Any, List
from fastapi import APIRouter, HTTPException
from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.schemas.academic_year import AcademicYear, AcademicYearCreate, AcademicYearUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[AcademicYear])
def read_academic_years(session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100) -> Any:
    return crud.academic_year.get_multi(session, skip=skip, limit=limit)

@router.get("/{id}", response_model=AcademicYear)
def read_academic_year(id: int, session: SessionDep, current_user: CurrentUser) -> Any:
    item = crud.academic_year.get(session, id=id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return item

@router.post("/", response_model=AcademicYear)
def create_academic_year(*, session: SessionDep, item_in: AcademicYearCreate, current_user: CurrentUser) -> Any:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.academic_year.create(session, obj_in=item_in)

@router.put("/{id}", response_model=AcademicYear)
def update_academic_year(*, session: SessionDep, id: int, item_in: AcademicYearUpdate, current_user: CurrentUser) -> Any:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    item = crud.academic_year.get(session, id=id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.academic_year.update(session, db_obj=item, obj_in=item_in)

@router.delete("/{id}", response_model=AcademicYear)
def delete_academic_year(*, session: SessionDep, id: int, current_user: CurrentUser) -> Any:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    item = crud.academic_year.get(session, id=id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.academic_year.remove(session, id=id)
