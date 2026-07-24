from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Faculty(Base):
    __tablename__ = "faculty"

    id = Column(Integer, primary_key=True, index=True)
    faculty_name = Column(String)
    email = Column(String, unique=True, index=True)
    phone = Column(String, nullable=True)
    designation = Column(String, nullable=True)
    department_id = Column(Integer, ForeignKey("department.id"))
    status = Column(Boolean, default=True)

    department = relationship("Department", back_populates="faculties")
    subjects = relationship("Subject", back_populates="faculty")
