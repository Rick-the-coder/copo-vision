from sqlalchemy import Column, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class CourseOffering(Base):
    __tablename__ = "course_offering"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("course.id"))
    faculty_id = Column(Integer, ForeignKey("faculty.id"))
    semester_id = Column(Integer, ForeignKey("semester.id"))
    section_id = Column(Integer, ForeignKey("section.id"))
    academic_year_id = Column(Integer, ForeignKey("academic_year.id"))
    status = Column(Boolean, default=True)

    course = relationship("Course")
    faculty = relationship("Faculty")
    semester = relationship("Semester")
    section = relationship("Section")
    academic_year = relationship("AcademicYear")
