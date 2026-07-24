from typing import Optional
from datetime import datetime, date
from pydantic import BaseModel

class QuestionBankBase(BaseModel):
    course_id: int
    unit: int
    question_number: str
    question_text: str
    maximum_marks: float
    question_type: str
    difficulty_level: str
    bloom_level: str
    co_id: int | None = None
    status: bool = True

class QuestionBankCreate(QuestionBankBase):
    pass

class QuestionBankUpdate(QuestionBankBase):
    pass

class QuestionBankInDBBase(QuestionBankBase):
    id: int

    class Config:
        from_attributes = True

class QuestionBank(QuestionBankInDBBase):
    pass
