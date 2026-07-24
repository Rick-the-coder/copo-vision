from app.crud.base import CRUDBase
from app.models.question_bank import QuestionBank
from app.schemas.question_bank import QuestionBankCreate, QuestionBankUpdate

class CRUDQuestionBank(CRUDBase[QuestionBank, QuestionBankCreate, QuestionBankUpdate]):
    pass

question_bank = CRUDQuestionBank(QuestionBank)
