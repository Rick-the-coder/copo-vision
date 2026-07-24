from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class COAttainmentHistory(Base):
    __tablename__ = "co_attainment_history"

    id = Column(Integer, primary_key=True, index=True)
    co_attainment_id = Column(Integer, ForeignKey("co_attainment.id"))
    previous_percentage = Column(Float, nullable=True)
    new_percentage = Column(Float)
    calculated_on = Column(DateTime(timezone=True), server_default=func.now())
    calculated_by = Column(Integer, ForeignKey("user.id"))

    co_attainment = relationship("COAttainment")
    user = relationship("User")
