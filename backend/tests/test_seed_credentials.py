import os
from unittest.mock import MagicMock, patch
import pytest

from app.models.user import User, UserRole
from app.core import security
from seed import init_db
from add_users import create_user_if_not_exists


def test_seed_requires_admin_password_when_missing():
    """Verify that seed.py fails closed with RuntimeError when SEED_ADMIN_PASSWORD is missing/empty."""
    mock_db = MagicMock()

    # Clear SEED_ADMIN_PASSWORD if set
    env_vars = {"SEED_ADMIN_PASSWORD": ""}

    with patch.dict(os.environ, env_vars, clear=False):
        with patch("seed.SessionLocal", return_value=mock_db):
            with patch("app.crud.user.get_by_email", return_value=None):
                with pytest.raises(RuntimeError) as exc_info:
                    init_db()
                assert "SEED_ADMIN_PASSWORD" in str(exc_info.value)
                assert "must be set" in str(exc_info.value)


def test_seed_init_db_with_custom_env_credentials():
    """Verify that seed.py uses SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD from environment."""
    mock_db = MagicMock()
    custom_email = "secure_admin@customdomain.org"
    custom_password = "SuperSecurePassword999!"

    env_vars = {
        "SEED_ADMIN_EMAIL": custom_email,
        "SEED_ADMIN_PASSWORD": custom_password,
    }

    created_user_obj = None

    def fake_create(db, *, obj_in):
        nonlocal created_user_obj
        created_user_obj = obj_in
        user = User(
            id=1,
            email=obj_in.email,
            name=obj_in.name,
            role=obj_in.role,
            status=obj_in.status,
            password=security.get_password_hash(obj_in.password),
        )
        return user

    with patch.dict(os.environ, env_vars, clear=False):
        with patch("seed.SessionLocal", return_value=mock_db):
            with patch("app.crud.user.get_by_email", return_value=None):
                with patch("app.crud.user.create", side_effect=fake_create):
                    init_db()

    assert created_user_obj is not None
    assert created_user_obj.email == custom_email
    assert created_user_obj.password == custom_password
    assert created_user_obj.role == UserRole.ADMIN
    assert created_user_obj.status is True


def test_seed_init_db_skips_if_admin_already_exists():
    """Verify that seed.py does not recreate or overwrite admin if already present (no password needed)."""
    mock_db = MagicMock()
    existing_user = MagicMock(spec=User)
    existing_user.email = "admin@copovision.com"

    # Even without SEED_ADMIN_PASSWORD set, existing admin check should succeed without error
    env_vars = {"SEED_ADMIN_PASSWORD": ""}

    with patch.dict(os.environ, env_vars, clear=False):
        with patch("seed.SessionLocal", return_value=mock_db):
            with patch("app.crud.user.get_by_email", return_value=existing_user):
                with patch("app.crud.user.create") as mock_create:
                    init_db()
                    mock_create.assert_not_called()


def test_add_users_requires_default_password_when_missing():
    """Verify that add_users.py fails closed with RuntimeError when DEFAULT_USER_PASSWORD is missing/empty."""
    mock_session = MagicMock()
    mock_query = MagicMock()
    mock_session.query.return_value = mock_query
    mock_query.filter_by.return_value.first.return_value = None

    env_vars = {"DEFAULT_USER_PASSWORD": ""}

    with patch.dict(os.environ, env_vars, clear=False):
        with pytest.raises(RuntimeError) as exc_info:
            create_user_if_not_exists(
                session=mock_session,
                email="faculty1@university.edu",
                name="Dr. Smith",
                role=UserRole.FACULTY,
            )
        assert "DEFAULT_USER_PASSWORD" in str(exc_info.value)
        assert "must be set" in str(exc_info.value)


def test_add_users_custom_default_password():
    """Verify that add_users.py respects explicitly provided DEFAULT_USER_PASSWORD environment variable."""
    mock_session = MagicMock()
    mock_query = MagicMock()
    mock_session.query.return_value = mock_query
    mock_query.filter_by.return_value.first.return_value = None

    custom_default_pw = "CustomUserDefaultPass123!"

    with patch.dict(os.environ, {"DEFAULT_USER_PASSWORD": custom_default_pw}, clear=False):
        user = create_user_if_not_exists(
            session=mock_session,
            email="faculty1@university.edu",
            name="Dr. Smith",
            role=UserRole.FACULTY,
        )

    assert user.email == "faculty1@university.edu"
    assert user.role == UserRole.FACULTY
    assert user.status is True
    # Password must be hashed and verifiable with the custom password
    assert security.verify_password(custom_default_pw, user.password)
    mock_session.add.assert_called_once_with(user)
    mock_session.commit.assert_called_once()
