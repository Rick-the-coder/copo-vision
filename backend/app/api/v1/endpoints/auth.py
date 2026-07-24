from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.core import security
from app.core.config import settings
from app.schemas.token import Token
from app.schemas.user import User

router = APIRouter()

@router.post("/login", response_model=Token)
def login_access_token(
    session: SessionDep, form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = crud.user.get_by_email(session, email=form_data.username)
    if not user or not security.verify_password(form_data.password, user.password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.status:
        raise HTTPException(status_code=400, detail="Inactive user")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/logout")
def logout(current_user: CurrentUser) -> Any:
    """
    Logout user. (For stateless JWT, this is usually handled on the frontend by discarding the token).
    """
    return {"message": "Successfully logged out"}

@router.post("/refresh", response_model=Token)
def refresh_token(current_user: CurrentUser, session: SessionDep) -> Any:
    """
    Refresh access token.
    """
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            current_user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/forgot-password")
def forgot_password(email: str, session: SessionDep) -> Any:
    """
    Password Recovery (Skeleton for Phase 1).
    """
    user = crud.user.get_by_email(session, email=email)
    if not user:
        return {"msg": "If an account with this email exists, a password reset link has been sent."}
    return {"msg": "Password recovery email sent (Simulation)"}

@router.post("/reset-password")
def reset_password(token: str, new_password: str, session: SessionDep) -> Any:
    """
    Reset password (Skeleton for Phase 1).
    """
    return {"msg": "Password reset successfully (Simulation)"}
