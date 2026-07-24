from app.crud.base import CRUDBase
from app.models.po_models import POAttainmentHistory
from app.schemas.po_attainment_history import POAttainmentHistoryCreate, POAttainmentHistoryUpdate

class CRUDPOAttainmentHistory(CRUDBase[POAttainmentHistory, POAttainmentHistoryCreate, POAttainmentHistoryUpdate]):
    pass

po_attainment_history = CRUDPOAttainmentHistory(POAttainmentHistory)
