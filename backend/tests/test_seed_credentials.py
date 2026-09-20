import os
import sys
from unittest.mock import MagicMock, patch
import pytest
from werkzeug.security import check_password_hash

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from create_user import create_user


def test_create_user_fails_closed_when_password_missing():
    """Verify that create_user() fails closed with RuntimeError when password is missing/empty."""
    env_vars = {
        "SEED_USER_PASSWORD": "",
        "DEFAULT_USER_PASSWORD": "",
    }
    with patch.dict(os.environ, env_vars, clear=False):
        with pytest.raises(RuntimeError) as exc_info:
            create_user()
        assert "SEED_USER_PASSWORD or DEFAULT_USER_PASSWORD" in str(exc_info.value)
        assert "must be set" in str(exc_info.value)


def test_create_user_succeeds_with_env_password():
    """Verify that create_user() reads password from environment and hashes it properly."""
    custom_password = "SecureFacultyPassword123!"
    env_vars = {
        "SEED_USER_PASSWORD": custom_password,
        "SEED_USERNAME": "faculty_test",
        "SEED_FULL_NAME": "Test Professor",
        "SEED_ROLE": "faculty",
    }

    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value = mock_cursor

    with patch.dict(os.environ, env_vars, clear=False):
        with patch("create_user.get_db_connection", return_value=mock_conn):
            create_user()

    # Verify query execution
    assert mock_cursor.execute.called
    query, params = mock_cursor.execute.call_args[0]
    username, password_hash, full_name, role, is_active = params

    assert username == "faculty_test"
    assert full_name == "Test Professor"
    assert role == "faculty"
    assert is_active == 1
    # Check that password hash verifies with the custom password
    assert check_password_hash(password_hash, custom_password)
    mock_conn.commit.assert_called_once()
    mock_conn.close.assert_called_once()


def test_create_user_fallback_to_default_user_password():
    """Verify that create_user() accepts DEFAULT_USER_PASSWORD if SEED_USER_PASSWORD is not set."""
    custom_default_pw = "DefaultUserSecurePass456!"
    env_vars = {
        "SEED_USER_PASSWORD": "",
        "DEFAULT_USER_PASSWORD": custom_default_pw,
        "SEED_USERNAME": "admin_user",
        "SEED_ROLE": "admin",
    }

    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value = mock_cursor

    with patch.dict(os.environ, env_vars, clear=False):
        with patch("create_user.get_db_connection", return_value=mock_conn):
            create_user()

    assert mock_cursor.execute.called
    query, params = mock_cursor.execute.call_args[0]
    username, password_hash, full_name, role, is_active = params

    assert username == "admin_user"
    assert role == "admin"
    assert check_password_hash(password_hash, custom_default_pw)
