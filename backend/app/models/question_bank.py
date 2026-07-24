from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class QuestionBank(Base):
    __tablename__ = "question_bank"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("course.id"))
    unit = Column(Integer)
    question_number = Column(String)
    question_text = Column(String)
    maximum_marks = Column(Float)
    question_type = Column(String) # e.g., 'MCQ', 'Short Answer'
    difficulty_level = Column(String) # e.g., 'Easy', 'Medium', 'Hard'
    bloom_level = Column(String) # e.g., 'Remember', 'Understand', 'Apply'
    co_id = Column(Integer, ForeignKey("course_outcome.id"), nullable=True)
    status = Column(Boolean, default=True)

    course = relationship("Course")
    course_outcome = relationship("CourseOutcome")
