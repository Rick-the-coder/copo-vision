from app.crud.base import CRUDBase
from app.models.co_attainment_history import COAttainmentHistory
from app.schemas.co_attainment_history import COAttainmentHistoryCreate, COAttainmentHistoryUpdate

class CRUDCOAttainmentHistory(CRUDBase[COAttainmentHistory, COAttainmentHistoryCreate, COAttainmentHistoryUpdate]):
    pass

co_attainment_history = CRUDCOAttainmentHistory(COAttainmentHistory)
