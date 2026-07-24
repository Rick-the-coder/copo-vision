from sqlalchemy import Column, Integer, String, Boolean, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Assessment(Base):
    __tablename__ = "assessment"

    id = Column(Integer, primary_key=True, index=True)
    assessment_name = Column(String, index=True)
    assessment_type_id = Column(Integer, ForeignKey("assessment_type.id"))
    course_id = Column(Integer, ForeignKey("course.id"))
    semester_id = Column(Integer, ForeignKey("semester.id"))
    academic_year_id = Column(Integer, ForeignKey("academic_year.id"))
    faculty_id = Column(Integer, ForeignKey("faculty.id"))
    
    maximum_marks = Column(Float)
    passing_marks = Column(Float)
    weightage = Column(Float) # Percentage weight in final grade
    schedule_date = Column(Date, nullable=True)
    status = Column(Boolean, default=True)

    assessment_type = relationship("AssessmentType")
    course = relationship("Course")
    semester = relationship("Semester")
    academic_year = relationship("AcademicYear")
    faculty = relationship("Faculty")
