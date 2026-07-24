from app.crud.base import CRUDBase
from app.models.course_offering import CourseOffering
from app.schemas.course_offering import CourseOfferingCreate, CourseOfferingUpdate

class CRUDCourseOffering(CRUDBase[CourseOffering, CourseOfferingCreate, CourseOfferingUpdate]):
    pass

course_offering = CRUDCourseOffering(CourseOffering)
