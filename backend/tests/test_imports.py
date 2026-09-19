import io
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from app.main import app
from app.api.deps import get_current_user, get_db
from app.models.user import User, UserRole

client = TestClient(app)


def mock_admin_user():
    user = MagicMock(spec=User)
    user.id = 1
    user.email = "admin@example.com"
    user.role = UserRole.ADMIN
    user.is_active = True
    return user


def mock_student_user():
    user = MagicMock(spec=User)
    user.id = 2
    user.email = "student@example.com"
    user.role = UserRole.STUDENT
    user.is_active = True
    return user


def test_import_unauthorized():
    """Unauthenticated import requests must be rejected with 401."""
    app.dependency_overrides.clear()
    csv_content = b"course_code,course_name,duration,department_id\nCS101,Intro to CS,4,1\n"
    response = client.post(
        "/api/v1/imports/courses",
        files={"file": ("courses.csv", io.BytesIO(csv_content), "text/csv")}
    )
    assert response.status_code == 401


def test_import_forbidden_role():
    """Users without ADMIN or HOD roles must receive 403 Forbidden."""
    app.dependency_overrides[get_current_user] = mock_student_user
    app.dependency_overrides[get_db] = lambda: MagicMock()

    try:
        csv_content = b"course_code,course_name,duration,department_id\nCS101,Intro to CS,4,1\n"
        response = client.post(
            "/api/v1/imports/courses",
            files={"file": ("courses.csv", io.BytesIO(csv_content), "text/csv")}
        )
        assert response.status_code == 403
        assert "Not enough permissions" in response.json()["detail"]
    finally:
        app.dependency_overrides.clear()


def test_import_invalid_file_extension():
    """Non-CSV files must be rejected with HTTP 400."""
    app.dependency_overrides[get_current_user] = mock_admin_user
    app.dependency_overrides[get_db] = lambda: MagicMock()

    try:
        response = client.post(
            "/api/v1/imports/courses",
            files={"file": ("courses.txt", io.BytesIO(b"data"), "text/plain")}
        )
        assert response.status_code == 400
        assert "Only CSV files are allowed" in response.json()["detail"]
    finally:
        app.dependency_overrides.clear()


def test_import_unsupported_entity():
    """Unsupported entity import requests must return HTTP 400."""
    app.dependency_overrides[get_current_user] = mock_admin_user
    app.dependency_overrides[get_db] = lambda: MagicMock()

    try:
        csv_content = b"col1,col2\nval1,val2\n"
        response = client.post(
            "/api/v1/imports/unknown_entity_type",
            files={"file": ("data.csv", io.BytesIO(csv_content), "text/csv")}
        )
        assert response.status_code == 400
        assert "Unsupported entity" in response.json()["detail"]
    finally:
        app.dependency_overrides.clear()


def test_import_success():
    """Successful CSV import inserts records and reports success count."""
    mock_db = MagicMock()
    app.dependency_overrides[get_current_user] = mock_admin_user
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        csv_content = b"course_code,course_name,duration,department_id\nCS101,Intro to CS,4,1\n"
        with patch("app.crud.course.create") as mock_create:
            mock_create.return_value = MagicMock()
            response = client.post(
                "/api/v1/imports/courses",
                files={"file": ("courses.csv", io.BytesIO(csv_content), "text/csv")}
            )
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "completed"
            assert data["summary"]["success"] == 1
            assert data["summary"]["failed"] == 0
            assert len(data["summary"]["errors"]) == 0
    finally:
        app.dependency_overrides.clear()


def test_import_integrity_error_no_information_exposure():
    """Database IntegrityError must NOT expose internal SQL queries or schema details."""
    mock_db = MagicMock()
    app.dependency_overrides[get_current_user] = mock_admin_user
    app.dependency_overrides[get_db] = lambda: mock_db

    sensitive_sql_leak = (
        "INSERT INTO courses (course_code, course_name, duration, department_id) "
        "VALUES ('CS101', 'Intro', 4, 1) DETAIL: Key (course_code)=(CS101) already exists in table 'courses'."
    )

    try:
        csv_content = b"course_code,course_name,duration,department_id\nCS101,Intro to CS,4,1\n"
        with patch("app.crud.course.create") as mock_create:
            mock_create.side_effect = IntegrityError(
                statement=sensitive_sql_leak,
                params={},
                orig=Exception("duplicate key violates unique constraint")
            )
            response = client.post(
                "/api/v1/imports/courses",
                files={"file": ("courses.csv", io.BytesIO(csv_content), "text/csv")}
            )
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "completed"
            assert data["summary"]["failed"] == 1
            assert len(data["summary"]["errors"]) == 1

            error_msg = data["summary"]["errors"][0]
            # Must contain safe description
            assert "Database integrity error" in error_msg
            # Must NOT contain internal SQL statement, table name, or driver details
            assert "INSERT INTO" not in error_msg
            assert "table 'courses'" not in error_msg
            assert "violates unique constraint" not in error_msg
            assert sensitive_sql_leak not in error_msg
            mock_db.rollback.assert_called()
    finally:
        app.dependency_overrides.clear()


def test_import_sqlalchemy_error_no_information_exposure():
    """General database exceptions must NOT expose connection strings or internal errors."""
    mock_db = MagicMock()
    app.dependency_overrides[get_current_user] = mock_admin_user
    app.dependency_overrides[get_db] = lambda: mock_db

    sensitive_db_err = "Internal database connection timeout at postgresql://app_user:secret_pass@10.0.1.5:5432/copovision"

    try:
        csv_content = b"course_code,course_name,duration,department_id\nCS101,Intro to CS,4,1\n"
        with patch("app.crud.course.create") as mock_create:
            mock_create.side_effect = SQLAlchemyError(sensitive_db_err)
            response = client.post(
                "/api/v1/imports/courses",
                files={"file": ("courses.csv", io.BytesIO(csv_content), "text/csv")}
            )
            assert response.status_code == 200
            data = response.json()
            assert data["summary"]["failed"] == 1
            error_msg = data["summary"]["errors"][0]
            assert "Database operation failed" in error_msg
            assert "secret_pass" not in error_msg
            assert "10.0.1.5" not in error_msg
            mock_db.rollback.assert_called()
    finally:
        app.dependency_overrides.clear()


def test_import_unexpected_exception_no_stack_trace_exposure():
    """Unexpected runtime exceptions must NOT leak tracebacks or file paths."""
    mock_db = MagicMock()
    app.dependency_overrides[get_current_user] = mock_admin_user
    app.dependency_overrides[get_db] = lambda: mock_db

    internal_traceback_message = "IndexError: list index out of range at /app/core/secret_handler.py:128"

    try:
        csv_content = b"course_code,course_name,duration,department_id\nCS101,Intro to CS,4,1\n"
        with patch("app.crud.course.create") as mock_create:
            mock_create.side_effect = RuntimeError(internal_traceback_message)
            response = client.post(
                "/api/v1/imports/courses",
                files={"file": ("courses.csv", io.BytesIO(csv_content), "text/csv")}
            )
            assert response.status_code == 200
            data = response.json()
            assert data["summary"]["failed"] == 1
            error_msg = data["summary"]["errors"][0]
            assert "Failed to process record" in error_msg
            assert "secret_handler.py" not in error_msg
            assert "IndexError" not in error_msg
            mock_db.rollback.assert_called()
    finally:
        app.dependency_overrides.clear()


def test_import_validation_error_clean_formatting():
    """Pydantic validation errors should provide clean field hints without full stack traces."""
    app.dependency_overrides[get_current_user] = mock_admin_user
    app.dependency_overrides[get_db] = lambda: MagicMock()

    try:
        # Invalid: missing required fields for courses
        csv_content = b"course_name\nJust a name\n"
        response = client.post(
            "/api/v1/imports/courses",
            files={"file": ("courses.csv", io.BytesIO(csv_content), "text/csv")}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["summary"]["failed"] == 1
        error_msg = data["summary"]["errors"][0]
        assert "Validation Error" in error_msg
        assert "\n" not in error_msg  # No multiline raw traceback
    finally:
        app.dependency_overrides.clear()
