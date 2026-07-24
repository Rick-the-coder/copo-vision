from app.crud.base import CRUDBase
from app.models.co_configuration import COConfiguration
from app.schemas.co_configuration import COConfigurationCreate, COConfigurationUpdate

class CRUDCOConfiguration(CRUDBase[COConfiguration, COConfigurationCreate, COConfigurationUpdate]):
    pass

co_configuration = CRUDCOConfiguration(COConfiguration)
