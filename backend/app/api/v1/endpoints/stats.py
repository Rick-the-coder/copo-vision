from typing import Any
from fastapi import APIRouter
from sqlalchemy import func
from app.api.deps import SessionDep, CurrentUser
from app.models.user import User
from app.models.department import Department
from app.models.course import Course
from app.models.subject import Subject
from app.models.faculty import Faculty
from app.models.student import Student

router = APIRouter()

@router.get("/")
def get_dashboard_stats(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Get total counts for dashboard statistics.
    """
    return {
        "users": session.query(func.count(User.id)).scalar() or 0,
        "departments": session.query(func.count(Department.id)).scalar() or 0,
        "courses": session.query(func.count(Course.id)).scalar() or 0,
        "subjects": session.query(func.count(Subject.id)).scalar() or 0,
        "faculty": session.query(func.count(Faculty.id)).scalar() or 0,
        "students": session.query(func.count(Student.id)).scalar() or 0,
    }
