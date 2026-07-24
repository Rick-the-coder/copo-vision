from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Batch(Base):
    __tablename__ = "batch"

    id = Column(Integer, primary_key=True, index=True)
    batch_name = Column(String, index=True)
    batch_year = Column(Integer)
    program_id = Column(Integer, ForeignKey("program.id"))
    academic_year_id = Column(Integer, ForeignKey("academic_year.id"))
    status = Column(Boolean, default=True)

    program = relationship("Program", back_populates="batches")
    academic_year = relationship("AcademicYear")
    sections = relationship("Section", back_populates="batch")
