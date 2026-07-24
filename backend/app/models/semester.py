from sqlalchemy import Column, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Semester(Base):
    __tablename__ = "semester"

    id = Column(Integer, primary_key=True, index=True)
    semester_number = Column(Integer)
    academic_year_id = Column(Integer, ForeignKey("academic_year.id"))
    status = Column(Boolean, default=True)

    academic_year = relationship("AcademicYear", back_populates="semesters")
    students = relationship("Student", back_populates="semester")
