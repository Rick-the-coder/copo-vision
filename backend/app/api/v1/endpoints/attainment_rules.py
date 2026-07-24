from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.schemas.attainment_rule import AttainmentRule, AttainmentRuleCreate, AttainmentRuleUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[AttainmentRule])
def read_attainment_rules(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return crud.attainment_rule.get_multi(session, skip=skip, limit=limit)

@router.post("/", response_model=AttainmentRule)
def create_attainment_rule(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    attainment_rule_in: AttainmentRuleCreate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.attainment_rule.create(session, obj_in=attainment_rule_in)

@router.put("/{id}", response_model=AttainmentRule)
def update_attainment_rule(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
    attainment_rule_in: AttainmentRuleUpdate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.attainment_rule.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.attainment_rule.update(session, db_obj=obj, obj_in=attainment_rule_in)

@router.delete("/{id}", response_model=AttainmentRule)
def delete_attainment_rule(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.attainment_rule.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.attainment_rule.remove(session, id=id)
