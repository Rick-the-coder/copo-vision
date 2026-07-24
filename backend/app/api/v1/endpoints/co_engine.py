from typing import Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.api.deps import SessionDep, CurrentUser
from app.models.user import UserRole
from app.services.calculation import COCalculationService

router = APIRouter()

class CalculateRequest(BaseModel):
    assessment_id: int

@router.post("/calculate")
def calculate_co_attainment(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    payload: CalculateRequest
) -> Any:
    """
    Execute batch CO Attainment calculation for a specific assessment.
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    service = COCalculationService(session=session, user_id=current_user.id)
    result = service.calculate_for_assessment(assessment_id=payload.assessment_id)
    
    return result

@router.post("/recalculate")
def recalculate_co_attainment(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    payload: CalculateRequest
) -> Any:
    """
    Recalculate CO Attainment (functions identically in the engine, but keeps history).
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    service = COCalculationService(session=session, user_id=current_user.id)
    result = service.calculate_for_assessment(assessment_id=payload.assessment_id)
    
    return result
