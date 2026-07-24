from app.crud.base import CRUDBase
from app.models.academic_calendar import AcademicCalendar
from app.schemas.academic_calendar import AcademicCalendarCreate, AcademicCalendarUpdate

class CRUDAcademicCalendar(CRUDBase[AcademicCalendar, AcademicCalendarCreate, AcademicCalendarUpdate]):
    pass

academic_calendar = CRUDAcademicCalendar(AcademicCalendar)
