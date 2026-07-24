from app.crud.base import CRUDBase
from app.models.curriculum import Curriculum
from app.schemas.curriculum import CurriculumCreate, CurriculumUpdate

class CRUDCurriculum(CRUDBase[Curriculum, CurriculumCreate, CurriculumUpdate]):
    pass

curriculum = CRUDCurriculum(Curriculum)
