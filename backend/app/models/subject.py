from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Subject(Base):
    __tablename__ = "subject"

    id = Column(Integer, primary_key=True, index=True)
    subject_name = Column(String, index=True)
    subject_code = Column(String, unique=True, index=True)
    semester = Column(Integer)
    credits = Column(Integer)
    course_id = Column(Integer, ForeignKey("course.id"))
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=True)
    status = Column(Boolean, default=True)

    course = relationship("Course", back_populates="subjects")
    faculty = relationship("Faculty", back_populates="subjects")
