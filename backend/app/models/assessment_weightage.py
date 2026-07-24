from sqlalchemy import Column, Integer, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class AssessmentWeightage(Base):
    __tablename__ = "assessment_weightage"

    id = Column(Integer, primary_key=True, index=True)
    assessment_type_id = Column(Integer, ForeignKey("assessment_type.id"))
    course_id = Column(Integer, ForeignKey("course.id"))
    weightage_percentage = Column(Float)
    is_active = Column(Boolean, default=True)

    assessment_type = relationship("AssessmentType")
    course = relationship("Course")
