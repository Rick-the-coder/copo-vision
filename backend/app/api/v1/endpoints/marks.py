from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.models.user import UserRole
from app.models.student_mark import StudentMark
from app.models.assessment import Assessment

router = APIRouter()

class MarkEntryItem(BaseModel):
    student_id: int
    question_id: int | None = None
    marks_obtained: float
    remarks: str | None = None
    attendance_status: str = "Present"

class BulkMarksEntry(BaseModel):
    assessment_id: int
    is_final_submission: bool = False
    marks: List[MarkEntryItem]

@router.post("/bulk")
def bulk_enter_marks(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    payload: BulkMarksEntry,
) -> Any:
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    assessment = session.query(Assessment).filter(Assessment.id == payload.assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    max_marks = assessment.maximum_marks

    # Basic duplicate prevention: Delete previous marks for this assessment by this faculty (or just in general if updating)
    # A more robust system would check if it's already finalized.
    existing_marks = session.query(StudentMark).filter(StudentMark.assessment_id == payload.assessment_id).all()
    if any(m.is_final_submission for m in existing_marks) and current_user.role == UserRole.FACULTY:
        raise HTTPException(status_code=400, detail="Marks for this assessment are already finalized.")

    # Remove old draft marks
    session.query(StudentMark).filter(StudentMark.assessment_id == payload.assessment_id).delete()

    new_marks = []
    for item in payload.marks:
        if item.marks_obtained < 0 or item.marks_obtained > max_marks:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid marks {item.marks_obtained} for student {item.student_id}. Max allowed is {max_marks}"
            )
        
        mark_obj = StudentMark(
            student_id=item.student_id,
            assessment_id=payload.assessment_id,
            question_id=item.question_id,
            marks_obtained=item.marks_obtained,
            remarks=item.remarks,
            attendance_status=item.attendance_status,
            is_final_submission=payload.is_final_submission
        )
        new_marks.append(mark_obj)

    session.add_all(new_marks)
    session.commit()

    return {"status": "success", "message": f"{len(new_marks)} marks saved.", "finalized": payload.is_final_submission}
