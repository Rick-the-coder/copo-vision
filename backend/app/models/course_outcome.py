from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class CourseOutcome(Base):
    __tablename__ = "course_outcome"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("course.id"))
    co_number = Column(String, index=True)  # e.g., 'CO1', 'CO2'
    co_title = Column(String)
    co_description = Column(String)
    target_percentage = Column(Float)
    status = Column(Boolean, default=True)

    course = relationship("Course")
