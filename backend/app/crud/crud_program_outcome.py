from app.crud.base import CRUDBase
from app.models.po_models import ProgramOutcome
from app.schemas.program_outcome import ProgramOutcomeCreate, ProgramOutcomeUpdate

class CRUDProgramOutcome(CRUDBase[ProgramOutcome, ProgramOutcomeCreate, ProgramOutcomeUpdate]):
    pass

program_outcome = CRUDProgramOutcome(ProgramOutcome)
