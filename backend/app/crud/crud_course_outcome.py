from app.crud.base import CRUDBase
from app.models.course_outcome import CourseOutcome
from app.schemas.course_outcome import CourseOutcomeCreate, CourseOutcomeUpdate

class CRUDCourseOutcome(CRUDBase[CourseOutcome, CourseOutcomeCreate, CourseOutcomeUpdate]):
    pass

course_outcome = CRUDCourseOutcome(CourseOutcome)
