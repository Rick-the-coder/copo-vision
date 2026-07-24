from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class AcademicYear(Base):
    __tablename__ = "academic_year"

    id = Column(Integer, primary_key=True, index=True)
    academic_year = Column(String, index=True) # e.g. "2023-2024"
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    status = Column(Boolean, default=True)

    semesters = relationship("Semester", back_populates="academic_year")
