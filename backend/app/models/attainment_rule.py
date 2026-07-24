from sqlalchemy import Column, Integer, String, Boolean, Float
from app.db.base_class import Base

class AttainmentRule(Base):
    __tablename__ = "attainment_rule"

    id = Column(Integer, primary_key=True, index=True)
    level_name = Column(String, unique=True, index=True) # e.g., 'Level 0', 'Level 1'
    min_percentage = Column(Float)
    max_percentage = Column(Float)
    status = Column(Boolean, default=True)
