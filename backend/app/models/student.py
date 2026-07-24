from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Student(Base):
    __tablename__ = "student"

    id = Column(Integer, primary_key=True, index=True)
    student_name = Column(String)
    roll_number = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String, nullable=True)
    department_id = Column(Integer, ForeignKey("department.id"))
    course_id = Column(Integer, ForeignKey("course.id"))
    semester_id = Column(Integer, ForeignKey("semester.id"))
    program_id = Column(Integer, ForeignKey("program.id"), nullable=True)
    batch_id = Column(Integer, ForeignKey("batch.id"), nullable=True)
    section_id = Column(Integer, ForeignKey("section.id"), nullable=True)
    status = Column(Boolean, default=True)

    department = relationship("Department", back_populates="students")
    course = relationship("Course", back_populates="students")
    semester = relationship("Semester", back_populates="students")
    program = relationship("Program")
    batch = relationship("Batch")
    section = relationship("Section")
