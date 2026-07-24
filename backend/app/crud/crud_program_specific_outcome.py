from app.crud.base import CRUDBase
from app.models.po_models import ProgramSpecificOutcome
from app.schemas.program_specific_outcome import ProgramSpecificOutcomeCreate, ProgramSpecificOutcomeUpdate

class CRUDProgramSpecificOutcome(CRUDBase[ProgramSpecificOutcome, ProgramSpecificOutcomeCreate, ProgramSpecificOutcomeUpdate]):
    pass

program_specific_outcome = CRUDProgramSpecificOutcome(ProgramSpecificOutcome)
