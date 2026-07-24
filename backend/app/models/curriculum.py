from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Curriculum(Base):
    __tablename__ = "curriculum"

    id = Column(Integer, primary_key=True, index=True)
    curriculum_name = Column(String, index=True)
    version = Column(String)
    department_id = Column(Integer, ForeignKey("department.id"))
    program_id = Column(Integer, ForeignKey("program.id"))
    effective_date = Column(Date)
    status = Column(Boolean, default=True)
    courses_included = Column(JSONB, default=list) # Store list of course IDs or details

    department = relationship("Department")
    program = relationship("Program")
