from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class COAttainment(Base):
    __tablename__ = "co_attainment"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student.id"))
    course_id = Column(Integer, ForeignKey("course.id"))
    co_id = Column(Integer, ForeignKey("course_outcome.id"))
    assessment_id = Column(Integer, ForeignKey("assessment.id"), nullable=True) # If calculated per assessment
    
    attainment_percentage = Column(Float)
    attainment_level = Column(String) # e.g. Level 0, Level 1
    
    calculated_on = Column(DateTime(timezone=True), server_default=func.now())
    academic_year = Column(String)
    semester = Column(String)

    student = relationship("Student")
    course = relationship("Course")
    course_outcome = relationship("CourseOutcome")
    assessment = relationship("Assessment")
