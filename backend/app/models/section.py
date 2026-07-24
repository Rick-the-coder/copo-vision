from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Section(Base):
    __tablename__ = "section"

    id = Column(Integer, primary_key=True, index=True)
    section_name = Column(String, index=True)
    batch_id = Column(Integer, ForeignKey("batch.id"))
    semester_id = Column(Integer, ForeignKey("semester.id"))
    mentor_faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=True)
    status = Column(Boolean, default=True)

    batch = relationship("Batch", back_populates="sections")
    semester = relationship("Semester")
    mentor_faculty = relationship("Faculty")
