from app.crud.base import CRUDBase
from app.models.po_models import POConfiguration
from app.schemas.po_configuration import POConfigurationCreate, POConfigurationUpdate

class CRUDPOConfiguration(CRUDBase[POConfiguration, POConfigurationCreate, POConfigurationUpdate]):
    pass

po_configuration = CRUDPOConfiguration(POConfiguration)
