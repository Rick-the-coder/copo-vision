from app.crud.base import CRUDBase
from app.models.batch import Batch
from app.schemas.batch import BatchCreate, BatchUpdate

class CRUDBatch(CRUDBase[Batch, BatchCreate, BatchUpdate]):
    pass

batch = CRUDBatch(Batch)
