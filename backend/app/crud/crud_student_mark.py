from app.crud.base import CRUDBase
from app.models.student_mark import StudentMark
from app.schemas.student_mark import StudentMarkCreate, StudentMarkUpdate

class CRUDStudentMark(CRUDBase[StudentMark, StudentMarkCreate, StudentMarkUpdate]):
    pass

student_mark = CRUDStudentMark(StudentMark)
