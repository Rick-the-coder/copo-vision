from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Program(Base):
    __tablename__ = "program"

    id = Column(Integer, primary_key=True, index=True)
    program_name = Column(String, index=True)
    program_code = Column(String, unique=True, index=True)
    department_id = Column(Integer, ForeignKey("department.id"))
    duration = Column(Integer)  # in years
    degree_type = Column(String)  # e.g., UG, PG
    status = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    department = relationship("Department")
    batches = relationship("Batch", back_populates="program")
