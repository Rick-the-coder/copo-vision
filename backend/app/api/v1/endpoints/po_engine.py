from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Optional
from app.api.deps import SessionDep, CurrentUser
from app.models.user import UserRole
from app.services.po_calculation import POCalculationService
from app.models.po_models import COPOMapping, ProgramOutcome, ProgramSpecificOutcome
from app.models.course_outcome import CourseOutcome

router = APIRouter()

class CalculatePORequest(BaseModel):
    course_id: int

class MappingEntry(BaseModel):
    co_id: int
    po_id: Optional[int] = None
    pso_id: Optional[int] = None
    correlation_level: int

class MatrixSaveRequest(BaseModel):
    course_id: int
    mappings: List[MappingEntry]

@router.post("/calculate")
def calculate_po(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    req: CalculatePORequest
):
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    try:
        result = POCalculationService.calculate_po_for_course(
            db=session, 
            course_id=req.course_id, 
            user_id=current_user.id
        )
        return result
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recalculate")
def recalculate_po(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    req: CalculatePORequest
):
    # Recalculate uses the same underlying service method as it deletes existing records first
    return calculate_po(session=session, current_user=current_user, req=req)

@router.get("/matrix/{course_id}")
def get_mapping_matrix(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    course_id: int
):
    """
    Returns the CO-PO and CO-PSO mapping matrix for a given course.
    Structure designed for easy rendering in a frontend 2D grid.
    """
    # Get all COs for this course
    cos = session.query(CourseOutcome).filter(CourseOutcome.course_id == course_id).all()
    
    # Get all POs and PSOs (assuming they are department-wide or global for now)
    pos = session.query(ProgramOutcome).all()
    psos = session.query(ProgramSpecificOutcome).all()
    
    # Get existing mappings
    mappings = session.query(COPOMapping).filter(COPOMapping.course_id == course_id).all()
    
    # Build dictionary map: {(co_id, po_id): level, (co_id, pso_id, 'pso'): level}
    mapping_dict = {}
    for m in mappings:
        if m.po_id:
            mapping_dict[f"{m.co_id}_po_{m.po_id}"] = m.correlation_level
        if m.pso_id:
            mapping_dict[f"{m.co_id}_pso_{m.pso_id}"] = m.correlation_level

    # Format response for the frontend
    matrix_data = []
    for co in cos:
        row = {
            "co_id": co.id,
            "co_number": co.co_number,
            "po_mappings": {},
            "pso_mappings": {}
        }
        for po in pos:
            row["po_mappings"][po.id] = mapping_dict.get(f"{co.id}_po_{po.id}", 0)
        for pso in psos:
            row["pso_mappings"][pso.id] = mapping_dict.get(f"{co.id}_pso_{pso.id}", 0)
        
        matrix_data.append(row)
        
    return {
        "course_id": course_id,
        "pos": [{"id": p.id, "number": p.po_number, "title": p.po_title} for p in pos],
        "psos": [{"id": p.id, "number": p.pso_number, "title": p.pso_title} for p in psos],
        "matrix": matrix_data
    }

@router.post("/matrix/save")
def save_mapping_matrix(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    req: MatrixSaveRequest
):
    """
    Saves the CO-PO mapping matrix. Wipes existing mappings for the course and inserts the new ones.
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD]:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Delete existing mappings for this course
    session.query(COPOMapping).filter(COPOMapping.course_id == req.course_id).delete()
    
    # Insert new mappings
    new_mappings = []
    for mapping in req.mappings:
        if mapping.correlation_level > 0:
            new_mappings.append(
                COPOMapping(
                    course_id=req.course_id,
                    co_id=mapping.co_id,
                    po_id=mapping.po_id,
                    pso_id=mapping.pso_id,
                    correlation_level=mapping.correlation_level
                )
            )
            
    if new_mappings:
        session.bulk_save_objects(new_mappings)
        
    session.commit()
    return {"status": "success", "message": f"Saved {len(new_mappings)} mappings"}
