from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Course(Base):
    __tablename__ = "course"

    id = Column(Integer, primary_key=True, index=True)
    course_name = Column(String, index=True)
    course_code = Column(String, unique=True, index=True)
    duration = Column(Integer) # In years or semesters
    department_id = Column(Integer, ForeignKey("department.id"))
    status = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    department = relationship("Department", back_populates="courses")
    subjects = relationship("Subject", back_populates="course")
    students = relationship("Student", back_populates="course")
