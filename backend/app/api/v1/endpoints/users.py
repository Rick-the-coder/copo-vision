from typing import Any, List
from fastapi import APIRouter, HTTPException
from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.schemas.user import User, UserCreate, UserUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[User])
def read_users(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve users. Only Admin can retrieve all users.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    users = crud.user.get_multi(session, skip=skip, limit=limit)
    return users

@router.post("/", response_model=User)
def create_user(
    *,
    session: SessionDep,
    user_in: UserCreate,
    current_user: CurrentUser,
) -> Any:
    """
    Create new user.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    user = crud.user.get_by_email(session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = crud.user.create(session, obj_in=user_in)
    return user

@router.get("/me", response_model=User)
def read_user_me(
    current_user: CurrentUser,
) -> Any:
    """
    Get current user.
    """
    return current_user
