from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.db.base_class import Base

class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True) # Intentionally not foreign key to prevent cascading deletes on logs
    action = Column(String, index=True) # CREATE, UPDATE, DELETE, LOGIN, LOGOUT
    entity_type = Column(String) # e.g., 'Student', 'CourseOffering'
    entity_id = Column(Integer, nullable=True) 
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
