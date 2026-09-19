from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock, patch
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from jose import jwt

from app.main import app
from app.api.deps import get_current_user, get_db
from app.core import security
from app.core.config import settings
from app.models.user import User, UserRole


client = TestClient(app)


def create_mock_user(user_id: int = 1, email: str = "test@example.com", role: UserRole = UserRole.STUDENT, status: bool = True):
    user = MagicMock(spec=User)
    user.id = user_id
    user.email = email
    user.name = "Test User"
    user.role = role
    user.status = status
    return user


# ============================================================
# Direct Dependency Unit Tests
# ============================================================

def test_active_user_valid_jwt_direct():
    """Active user with a valid JWT is authenticated successfully."""
    mock_user = create_mock_user(user_id=10, status=True)
    mock_db = MagicMock()

    token = security.create_access_token(mock_user.id)

    with patch("app.crud.user.get", return_value=mock_user):
        authenticated_user = get_current_user(db=mock_db, token=token)
        assert authenticated_user.id == 10
        assert authenticated_user.status is True


def test_inactive_user_valid_jwt_rejected_direct():
    """Inactive user with a valid JWT is rejected with HTTP 400 'Inactive user'."""
    mock_user = create_mock_user(user_id=11, status=False)
    mock_db = MagicMock()

    token = security.create_access_token(mock_user.id)

    with patch("app.crud.user.get", return_value=mock_user):
        with pytest.raises(HTTPException) as exc_info:
            get_current_user(db=mock_db, token=token)
        assert exc_info.value.status_code == 400
        assert exc_info.value.detail == "Inactive user"


def test_user_deactivated_after_jwt_issuance_rejected_direct():
    """A token issued while user was active must be rejected once user.status becomes False."""
    mock_user = create_mock_user(user_id=12, status=True)
    mock_db = MagicMock()

    # Issue token when user is active
    token = security.create_access_token(mock_user.id)

    # Verify token works when active
    with patch("app.crud.user.get", return_value=mock_user):
        user = get_current_user(db=mock_db, token=token)
        assert user.id == 12

    # Admin deactivates user
    mock_user.status = False

    # Calling with the SAME previously issued token must now be rejected
    with patch("app.crud.user.get", return_value=mock_user):
        with pytest.raises(HTTPException) as exc_info:
            get_current_user(db=mock_db, token=token)
        assert exc_info.value.status_code == 400
        assert exc_info.value.detail == "Inactive user"


def test_user_reactivated_after_deactivation_direct():
    """A user who is reactivated can authenticate again with a valid unexpired token."""
    mock_user = create_mock_user(user_id=13, status=False)
    mock_db = MagicMock()

    token = security.create_access_token(mock_user.id)

    # Inactive -> rejected
    with patch("app.crud.user.get", return_value=mock_user):
        with pytest.raises(HTTPException) as exc_info:
            get_current_user(db=mock_db, token=token)
        assert exc_info.value.status_code == 400

    # Reactivate user
    mock_user.status = True

    # Reactivated -> accepted
    with patch("app.crud.user.get", return_value=mock_user):
        user = get_current_user(db=mock_db, token=token)
        assert user.id == 13
        assert user.status is True


def test_nonexistent_user_jwt_rejected_direct():
    """JWT referencing a user that no longer exists in the DB returns 404."""
    mock_db = MagicMock()
    token = security.create_access_token(9999)

    with patch("app.crud.user.get", return_value=None):
        with pytest.raises(HTTPException) as exc_info:
            get_current_user(db=mock_db, token=token)
        assert exc_info.value.status_code == 404
        assert exc_info.value.detail == "User not found"


def test_invalid_tampered_jwt_rejected_direct():
    """A tampered JWT returns HTTP 403 'Could not validate credentials'."""
    mock_db = MagicMock()
    with pytest.raises(HTTPException) as exc_info:
        get_current_user(db=mock_db, token="invalid.token.structure")
    assert exc_info.value.status_code == 403
    assert exc_info.value.detail == "Could not validate credentials"


def test_expired_jwt_rejected_direct():
    """An expired JWT returns HTTP 403 'Could not validate credentials'."""
    mock_db = MagicMock()
    past_expiration = datetime.now(timezone.utc) - timedelta(minutes=10)
    expired_token = jwt.encode(
        {"sub": "1", "exp": past_expiration},
        settings.SECRET_KEY,
        algorithm="HS256"
    )
    with pytest.raises(HTTPException) as exc_info:
        get_current_user(db=mock_db, token=expired_token)
    assert exc_info.value.status_code == 403
    assert exc_info.value.detail == "Could not validate credentials"


# ============================================================
# API Endpoint Integration Tests (via TestClient)
# ============================================================

def test_api_me_active_user_success():
    """Active user can access /api/v1/users/me with valid Bearer token."""
    mock_user = create_mock_user(user_id=1, email="active@example.com", role=UserRole.FACULTY, status=True)
    token = security.create_access_token(mock_user.id)

    app.dependency_overrides[get_db] = lambda: MagicMock()
    try:
        with patch("app.crud.user.get", return_value=mock_user):
            response = client.get(
                "/api/v1/users/me",
                headers={"Authorization": f"Bearer {token}"}
            )
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == 1
            assert data["email"] == "active@example.com"
            assert data["status"] is True
    finally:
        app.dependency_overrides.clear()


def test_api_me_inactive_user_rejected():
    """Inactive user is blocked from /api/v1/users/me with HTTP 400 'Inactive user'."""
    mock_user = create_mock_user(user_id=2, email="inactive@example.com", role=UserRole.STUDENT, status=False)
    token = security.create_access_token(mock_user.id)

    app.dependency_overrides[get_db] = lambda: MagicMock()
    try:
        with patch("app.crud.user.get", return_value=mock_user):
            response = client.get(
                "/api/v1/users/me",
                headers={"Authorization": f"Bearer {token}"}
            )
            assert response.status_code == 400
            assert response.json()["detail"] == "Inactive user"
    finally:
        app.dependency_overrides.clear()


def test_api_me_stale_jwt_after_deactivation():
    """Token generated while active is immediately rejected on /api/v1/users/me once deactivated."""
    mock_user = create_mock_user(user_id=3, email="stale@example.com", role=UserRole.FACULTY, status=True)
    token = security.create_access_token(mock_user.id)

    app.dependency_overrides[get_db] = lambda: MagicMock()
    try:
        # 1. First request when active -> 200 OK
        with patch("app.crud.user.get", return_value=mock_user):
            resp1 = client.get(
                "/api/v1/users/me",
                headers={"Authorization": f"Bearer {token}"}
            )
            assert resp1.status_code == 200

        # 2. Deactivate user
        mock_user.status = False

        # 3. Second request with the SAME token -> 400 Inactive user
        with patch("app.crud.user.get", return_value=mock_user):
            resp2 = client.get(
                "/api/v1/users/me",
                headers={"Authorization": f"Bearer {token}"}
            )
            assert resp2.status_code == 400
            assert resp2.json()["detail"] == "Inactive user"
    finally:
        app.dependency_overrides.clear()


def test_api_refresh_token_inactive_user_rejected():
    """Inactive user cannot refresh access tokens."""
    mock_user = create_mock_user(user_id=4, status=False)
    token = security.create_access_token(mock_user.id)

    app.dependency_overrides[get_db] = lambda: MagicMock()
    try:
        with patch("app.crud.user.get", return_value=mock_user):
            response = client.post(
                "/api/v1/auth/refresh",
                headers={"Authorization": f"Bearer {token}"}
            )
            assert response.status_code == 400
            assert response.json()["detail"] == "Inactive user"
    finally:
        app.dependency_overrides.clear()


@pytest.mark.parametrize("role", [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY, UserRole.STUDENT])
def test_all_roles_enforce_status_check(role: UserRole):
    """All user roles are rejected if their account is inactive."""
    inactive_user = create_mock_user(user_id=50, role=role, status=False)
    active_user = create_mock_user(user_id=50, role=role, status=True)

    token = security.create_access_token(50)
    app.dependency_overrides[get_db] = lambda: MagicMock()

    try:
        # Inactive user -> rejected with 400
        with patch("app.crud.user.get", return_value=inactive_user):
            resp_inactive = client.get(
                "/api/v1/users/me",
                headers={"Authorization": f"Bearer {token}"}
            )
            assert resp_inactive.status_code == 400
            assert resp_inactive.json()["detail"] == "Inactive user"

        # Active user -> succeeds with 200
        with patch("app.crud.user.get", return_value=active_user):
            resp_active = client.get(
                "/api/v1/users/me",
                headers={"Authorization": f"Bearer {token}"}
            )
            assert resp_active.status_code == 200
    finally:
        app.dependency_overrides.clear()


def test_inactive_admin_blocked_from_admin_endpoints():
    """An inactive ADMIN is rejected by authentication before reaching admin role checks."""
    inactive_admin = create_mock_user(user_id=1, role=UserRole.ADMIN, status=False)
    token = security.create_access_token(inactive_admin.id)

    app.dependency_overrides[get_db] = lambda: MagicMock()
    try:
        with patch("app.crud.user.get", return_value=inactive_admin):
            # /api/v1/users/ is admin-only
            response = client.get(
                "/api/v1/users/",
                headers={"Authorization": f"Bearer {token}"}
            )
            # Rejected at authentication level (400 Inactive user), not 403 or 200
            assert response.status_code == 400
            assert response.json()["detail"] == "Inactive user"
    finally:
        app.dependency_overrides.clear()
