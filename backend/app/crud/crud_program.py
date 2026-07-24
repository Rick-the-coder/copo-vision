from app.crud.base import CRUDBase
from app.models.program import Program
from app.schemas.program import ProgramCreate, ProgramUpdate

class CRUDProgram(CRUDBase[Program, ProgramCreate, ProgramUpdate]):
    pass

program = CRUDProgram(Program)
