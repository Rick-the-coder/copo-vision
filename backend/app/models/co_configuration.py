from sqlalchemy import Column, Integer, String, Boolean, Float
from app.db.base_class import Base

class COConfiguration(Base):
    __tablename__ = "co_configuration"

    id = Column(Integer, primary_key=True, index=True)
    target_percentage = Column(Float, default=60.0)
    calculation_method = Column(String, default="Average") # Average, Weighted Average, Best Assessment
    round_off_rules = Column(String, default="Standard")
    minimum_student_count = Column(Integer, default=5)
    status = Column(Boolean, default=True)
