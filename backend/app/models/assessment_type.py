from sqlalchemy import Column, Integer, String, Boolean
from app.db.base_class import Base

class AssessmentType(Base):
    __tablename__ = "assessment_type"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True) # e.g., 'CAE 1', 'Mid Semester'
    description = Column(String, nullable=True)
    status = Column(Boolean, default=True)
