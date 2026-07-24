from app.crud.base import CRUDBase
from app.models.po_models import POAttainment
from app.schemas.po_attainment import POAttainmentCreate, POAttainmentUpdate

class CRUDPOAttainment(CRUDBase[POAttainment, POAttainmentCreate, POAttainmentUpdate]):
    pass

po_attainment = CRUDPOAttainment(POAttainment)
