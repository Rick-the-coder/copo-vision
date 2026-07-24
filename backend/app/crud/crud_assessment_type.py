from app.crud.base import CRUDBase
from app.models.assessment_type import AssessmentType
from app.schemas.assessment_type import AssessmentTypeCreate, AssessmentTypeUpdate

class CRUDAssessmentType(CRUDBase[AssessmentType, AssessmentTypeCreate, AssessmentTypeUpdate]):
    pass

assessment_type = CRUDAssessmentType(AssessmentType)
