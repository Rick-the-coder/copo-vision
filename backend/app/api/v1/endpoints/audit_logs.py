from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.schemas.audit_log import AuditLog, AuditLogCreate, AuditLogUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[AuditLog])
def read_audit_logs(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return crud.audit_log.get_multi(session, skip=skip, limit=limit)

@router.post("/", response_model=AuditLog)
def create_audit_log(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    audit_log_in: AuditLogCreate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.audit_log.create(session, obj_in=audit_log_in)

@router.put("/{id}", response_model=AuditLog)
def update_audit_log(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
    audit_log_in: AuditLogUpdate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.audit_log.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.audit_log.update(session, db_obj=obj, obj_in=audit_log_in)

@router.delete("/{id}", response_model=AuditLog)
def delete_audit_log(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
) -> Any:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.audit_log.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.audit_log.remove(session, id=id)
