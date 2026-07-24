from app.crud.base import CRUDBase
from app.models.po_models import COPOMapping
from app.schemas.co_po_mapping import COPOMappingCreate, COPOMappingUpdate

class CRUDCOPOMapping(CRUDBase[COPOMapping, COPOMappingCreate, COPOMappingUpdate]):
    pass

co_po_mapping = CRUDCOPOMapping(COPOMapping)
