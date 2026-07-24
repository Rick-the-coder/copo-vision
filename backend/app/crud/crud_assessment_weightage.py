from app.crud.base import CRUDBase
from app.models.assessment_weightage import AssessmentWeightage
from app.schemas.assessment_weightage import AssessmentWeightageCreate, AssessmentWeightageUpdate

class CRUDAssessmentWeightage(CRUDBase[AssessmentWeightage, AssessmentWeightageCreate, AssessmentWeightageUpdate]):
    pass

assessment_weightage = CRUDAssessmentWeightage(AssessmentWeightage)
