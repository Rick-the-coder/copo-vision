from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class StudentMark(Base):
    __tablename__ = "student_mark"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student.id"))
    assessment_id = Column(Integer, ForeignKey("assessment.id"))
    question_id = Column(Integer, ForeignKey("question_bank.id"), nullable=True) # Optional for granular CO marking
    
    marks_obtained = Column(Float)
    remarks = Column(String, nullable=True)
    attendance_status = Column(String, default="Present") # Present, Absent
    is_final_submission = Column(Boolean, default=False)

    student = relationship("Student")
    assessment = relationship("Assessment")
    question = relationship("QuestionBank")
