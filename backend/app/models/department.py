from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Department(Base):
    __tablename__ = "department"

    id = Column(Integer, primary_key=True, index=True)
    department_name = Column(String, index=True)
    department_code = Column(String, unique=True, index=True)
    hod_name = Column(String, nullable=True)
    status = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    courses = relationship("Course", back_populates="department")
    faculties = relationship("Faculty", back_populates="department")
    students = relationship("Student", back_populates="department")
