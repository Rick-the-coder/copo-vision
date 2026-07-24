from sqlalchemy import Column, Integer, String, Boolean, Enum as SAEnum, DateTime
from sqlalchemy.sql import func
import enum
from app.db.base_class import Base

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    HOD = "HOD"
    FACULTY = "FACULTY"
    STUDENT = "STUDENT"

class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.STUDENT)
    status = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
