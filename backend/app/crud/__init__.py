from .crud_user import user
from .base import CRUDBase

from app.models.department import Department
from app.schemas.department import DepartmentCreate, DepartmentUpdate
department = CRUDBase[Department, DepartmentCreate, DepartmentUpdate](Department)

from app.models.course import Course
from app.schemas.course import CourseCreate, CourseUpdate
course = CRUDBase[Course, CourseCreate, CourseUpdate](Course)

from app.models.subject import Subject
from app.schemas.subject import SubjectCreate, SubjectUpdate
subject = CRUDBase[Subject, SubjectCreate, SubjectUpdate](Subject)

from app.models.academic_year import AcademicYear
from app.schemas.academic_year import AcademicYearCreate, AcademicYearUpdate
academic_year = CRUDBase[AcademicYear, AcademicYearCreate, AcademicYearUpdate](AcademicYear)

from app.models.semester import Semester
from app.schemas.semester import SemesterCreate, SemesterUpdate
semester = CRUDBase[Semester, SemesterCreate, SemesterUpdate](Semester)

from app.models.faculty import Faculty
from app.schemas.faculty import FacultyCreate, FacultyUpdate
faculty = CRUDBase[Faculty, FacultyCreate, FacultyUpdate](Faculty)

from app.models.student import Student
from app.schemas.student import StudentCreate, StudentUpdate
student = CRUDBase[Student, StudentCreate, StudentUpdate](Student)
from .crud_program import program
from .crud_batch import batch
from .crud_section import section
from .crud_course_offering import course_offering
from .crud_curriculum import curriculum
from .crud_academic_calendar import academic_calendar
from .crud_audit_log import audit_log
from .crud_course_outcome import course_outcome
from .crud_assessment_type import assessment_type
from .crud_assessment import assessment
from .crud_question_bank import question_bank
from .crud_student_mark import student_mark
from .crud_co_configuration import co_configuration
from .crud_attainment_rule import attainment_rule
from .crud_assessment_weightage import assessment_weightage
from .crud_co_attainment import co_attainment
from .crud_co_attainment_history import co_attainment_history
from .crud_co_configuration import co_configuration
from .crud_attainment_rule import attainment_rule
from .crud_assessment_weightage import assessment_weightage
from .crud_co_attainment import co_attainment
from .crud_co_attainment_history import co_attainment_history
from .crud_co_configuration import co_configuration
from .crud_attainment_rule import attainment_rule
from .crud_assessment_weightage import assessment_weightage
from .crud_co_attainment import co_attainment
from .crud_co_attainment_history import co_attainment_history
from .crud_co_configuration import co_configuration
from .crud_attainment_rule import attainment_rule
from .crud_assessment_weightage import assessment_weightage
from .crud_co_attainment import co_attainment
from .crud_co_attainment_history import co_attainment_history
from .crud_co_configuration import co_configuration
from .crud_attainment_rule import attainment_rule
from .crud_assessment_weightage import assessment_weightage
from .crud_co_attainment import co_attainment
from .crud_co_attainment_history import co_attainment_history
from .crud_co_configuration import co_configuration
from .crud_attainment_rule import attainment_rule
from .crud_assessment_weightage import assessment_weightage
from .crud_co_attainment import co_attainment
from .crud_co_attainment_history import co_attainment_history
from .crud_co_configuration import co_configuration
from .crud_attainment_rule import attainment_rule
from .crud_assessment_weightage import assessment_weightage
from .crud_co_attainment import co_attainment
from .crud_co_attainment_history import co_attainment_history
from .crud_program_outcome import program_outcome
from .crud_program_specific_outcome import program_specific_outcome
from .crud_co_po_mapping import co_po_mapping
from .crud_po_configuration import po_configuration
from .crud_po_attainment import po_attainment
from .crud_po_attainment_history import po_attainment_history
