from sqlalchemy import Column, Integer, Date, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class AcademicCalendar(Base):
    __tablename__ = "academic_calendar"

    id = Column(Integer, primary_key=True, index=True)
    academic_year_id = Column(Integer, ForeignKey("academic_year.id"))
    semester_id = Column(Integer, ForeignKey("semester.id"))
    start_date = Column(Date)
    end_date = Column(Date)
    
    # Store dynamic dates in JSONB for flexibility
    internal_exam_dates = Column(JSONB, default=list) 
    practical_dates = Column(JSONB, default=list)
    assignment_deadlines = Column(JSONB, default=list)
    holiday_list = Column(JSONB, default=list)

    academic_year = relationship("AcademicYear")
    semester = relationship("Semester")
