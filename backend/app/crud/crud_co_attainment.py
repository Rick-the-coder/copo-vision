from app.crud.base import CRUDBase
from app.models.co_attainment import COAttainment
from app.schemas.co_attainment import COAttainmentCreate, COAttainmentUpdate

class CRUDCOAttainment(CRUDBase[COAttainment, COAttainmentCreate, COAttainmentUpdate]):
    pass

co_attainment = CRUDCOAttainment(COAttainment)
