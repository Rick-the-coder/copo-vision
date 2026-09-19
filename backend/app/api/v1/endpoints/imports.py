import csv
import codecs
import logging
from typing import Any
from fastapi import APIRouter, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from pydantic import ValidationError

from app.api.deps import SessionDep, CurrentUser
from app.models.user import UserRole
from app import crud, schemas

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/{entity}")
def import_csv(
    entity: str,
    session: SessionDep,
    current_user: CurrentUser,
    file: UploadFile = File(...),
) -> Any:
    """
    Import entities via CSV.
    Supported entities: students, faculty, courses, programs, subjects.
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD]:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    if not file.filename or not file.filename.lower().endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")

    supported_entities = {
        "students": (crud.student, schemas.student.StudentCreate, "roll_number"),
        "faculty": (crud.faculty, schemas.faculty.FacultyCreate, "email"),
        "courses": (crud.course, schemas.course.CourseCreate, "course_code"),
        "programs": (crud.program, schemas.program.ProgramCreate, "program_code"),
        "subjects": (crud.subject, schemas.subject.SubjectCreate, "subject_code"),
        "question_banks": (crud.question_bank, schemas.question_bank.QuestionBankCreate, "question_number"),
        "course_outcomes": (crud.course_outcome, schemas.course_outcome.CourseOutcomeCreate, "co_number"),
    }

    if entity not in supported_entities:
        raise HTTPException(status_code=400, detail=f"Unsupported entity: {entity}")

    crud_obj, schema_class, unique_field = supported_entities[entity]
    
    csvReader = csv.DictReader(codecs.iterdecode(file.file, 'utf-8'))
    
    success_count = 0
    error_count = 0
    errors = []

    for row_num, row in enumerate(csvReader, start=2):
        try:
            # Clean empty strings to None if needed, depending on Pydantic config
            cleaned_row = {k: (v if v.strip() != "" else None) for k, v in row.items()}
            
            obj_in = schema_class(**cleaned_row)
            crud_obj.create(session, obj_in=obj_in)
            success_count += 1
        except ValidationError as e:
            error_count += 1
            error_details = []
            for err in e.errors():
                loc = ".".join(str(l) for l in err.get("loc", []) if l != "__root__")
                msg = err.get("msg", "Invalid value")
                if loc:
                    error_details.append(f"{loc}: {msg}")
                else:
                    error_details.append(msg)
            error_str = "; ".join(error_details) if error_details else "Invalid data format"
            errors.append(f"Row {row_num}: Validation Error - {error_str}")
        except IntegrityError:
            session.rollback()
            error_count += 1
            logger.warning("Database integrity error at row %d for entity %s", row_num, entity, exc_info=True)
            errors.append(f"Row {row_num}: Database integrity error (duplicate record or invalid reference)")
        except SQLAlchemyError:
            session.rollback()
            error_count += 1
            logger.error("Database error at row %d for entity %s", row_num, entity, exc_info=True)
            errors.append(f"Row {row_num}: Database operation failed")
        except Exception:
            session.rollback()
            error_count += 1
            logger.error("Unexpected error at row %d for entity %s", row_num, entity, exc_info=True)
            errors.append(f"Row {row_num}: Failed to process record")

    return {
        "status": "completed",
        "summary": {
            "total_processed": success_count + error_count,
            "success": success_count,
            "failed": error_count,
            "errors": errors[:50] # Limit error output
        }
    }
