from app.crud.base import CRUDBase
from app.models.section import Section
from app.schemas.section import SectionCreate, SectionUpdate

class CRUDSection(CRUDBase[Section, SectionCreate, SectionUpdate]):
    pass

section = CRUDSection(Section)
