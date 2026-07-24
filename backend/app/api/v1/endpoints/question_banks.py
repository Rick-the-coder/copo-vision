from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.schemas.question_bank import QuestionBank, QuestionBankCreate, QuestionBankUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[QuestionBank])
def read_question_banks(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return crud.question_bank.get_multi(session, skip=skip, limit=limit)

@router.post("/", response_model=QuestionBank)
def create_question_bank(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    question_bank_in: QuestionBankCreate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.question_bank.create(session, obj_in=question_bank_in)

@router.put("/{id}", response_model=QuestionBank)
def update_question_bank(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
    question_bank_in: QuestionBankUpdate,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.question_bank.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.question_bank.update(session, db_obj=obj, obj_in=question_bank_in)

@router.delete("/{id}", response_model=QuestionBank)
def delete_question_bank(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    obj = crud.question_bank.get(session, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return crud.question_bank.remove(session, id=id)
