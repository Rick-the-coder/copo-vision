from app.crud.base import CRUDBase
from app.models.assessment import Assessment
from app.schemas.assessment import AssessmentCreate, AssessmentUpdate

class CRUDAssessment(CRUDBase[Assessment, AssessmentCreate, AssessmentUpdate]):
    pass

assessment = CRUDAssessment(Assessment)
