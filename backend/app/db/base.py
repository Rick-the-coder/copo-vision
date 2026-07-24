# Import all the models, so that Base has them before being
# imported by Alembic
from app.db.base_class import Base
from app.models.user import User
from app.models.department import Department
from app.models.course import Course
from app.models.subject import Subject
from app.models.academic_year import AcademicYear
from app.models.semester import Semester
from app.models.faculty import Faculty
from app.models.student import Student
from app.models.program import Program
from app.models.batch import Batch
from app.models.section import Section
from app.models.course_offering import CourseOffering
from app.models.curriculum import Curriculum
from app.models.academic_calendar import AcademicCalendar
from app.models.audit_log import AuditLog
from app.models.course_outcome import CourseOutcome
from app.models.assessment_type import AssessmentType
from app.models.assessment import Assessment
from app.models.question_bank import QuestionBank
from app.models.student_mark import StudentMark
from app.models.co_configuration import COConfiguration
from app.models.attainment_rule import AttainmentRule
from app.models.assessment_weightage import AssessmentWeightage
from app.models.co_attainment import COAttainment
from app.models.co_attainment_history import COAttainmentHistory
from app.models.po_models import (
    ProgramOutcome,
    ProgramSpecificOutcome,
    COPOMapping,
    POConfiguration,
    POAttainment,
    POAttainmentHistory,
)
from app.models.ml_models import (
    MLDataset,
    MLTrainedModel,
    MLFeatureImportance,
    MLPredictionHistory,
)
