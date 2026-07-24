from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base_class import Base

class ProgramOutcome(Base):
    __tablename__ = "program_outcomes"

    id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String, index=True)
    po_title = Column(String)
    po_description = Column(Text, nullable=True)
    department_id = Column(Integer, ForeignKey("department.id"))
    status = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ProgramSpecificOutcome(Base):
    __tablename__ = "program_specific_outcomes"

    id = Column(Integer, primary_key=True, index=True)
    pso_number = Column(String, index=True)
    pso_title = Column(String)
    pso_description = Column(Text, nullable=True)
    department_id = Column(Integer, ForeignKey("department.id"))
    status = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class COPOMapping(Base):
    __tablename__ = "co_po_mapping"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("course.id"))
    co_id = Column(Integer, ForeignKey("course_outcome.id"))
    po_id = Column(Integer, ForeignKey("program_outcomes.id"), nullable=True)
    pso_id = Column(Integer, ForeignKey("program_specific_outcomes.id"), nullable=True)
    correlation_level = Column(Integer, default=0) # 0=None, 1=Low, 2=Medium, 3=High
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class POConfiguration(Base):
    __tablename__ = "po_configuration"

    id = Column(Integer, primary_key=True, index=True)
    target_percentage = Column(Float, default=70.0)
    correlation_scale = Column(Integer, default=3)
    calculation_method = Column(String, default="Weighted Average")
    attainment_levels = Column(String, default="Level 1, Level 2, Level 3")
    passing_rules = Column(String, default="Strict")
    status = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class POAttainment(Base):
    __tablename__ = "po_attainment"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student.id"), index=True)
    course_id = Column(Integer, ForeignKey("course.id"), index=True)
    po_id = Column(Integer, ForeignKey("program_outcomes.id"), nullable=True)
    pso_id = Column(Integer, ForeignKey("program_specific_outcomes.id"), nullable=True)
    achieved_percentage = Column(Float)
    attainment_level = Column(Integer, default=0)
    calculated_at = Column(DateTime, default=datetime.utcnow)

class POAttainmentHistory(Base):
    __tablename__ = "po_attainment_history"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(String)  # Unique identifier for the batch calculation run
    course_id = Column(Integer, ForeignKey("course.id"))
    calculated_by = Column(Integer, ForeignKey("user.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)
