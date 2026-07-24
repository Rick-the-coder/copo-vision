from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class CourseBase(BaseModel):
    course_name: str
    course_code: str
    duration: int
    department_id: int
    status: bool = True

class CourseCreate(CourseBase):
    pass

class CourseUpdate(CourseBase):
    course_name: Optional[str] = None
    course_code: Optional[str] = None
    duration: Optional[int] = None
    department_id: Optional[int] = None
    status: Optional[bool] = None

class CourseInDBBase(CourseBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class Course(CourseInDBBase):
    pass
