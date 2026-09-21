import os
import sys
import datetime
from unittest.mock import MagicMock, patch
import pytest
import jwt
from werkzeug.security import generate_password_hash

# Ensure backend directory is in sys.path
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

TEST_SECRET = "test-secret-key-that-is-at-least-32-characters-long-for-testing"
os.environ["SECRET_KEY"] = TEST_SECRET

from app import app
from utils.auth import get_jwt_secret, decode_jwt_token


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def create_token(user_id=1, username="testuser", role="faculty", exp_delta=datetime.timedelta(hours=1), secret=TEST_SECRET):
    payload = {
        "user_id": user_id,
        "username": username,
        "role": role,
        "exp": datetime.datetime.now(datetime.timezone.utc) + exp_delta,
    }
    return jwt.encode(payload, secret, algorithm="HS256")


@pytest.fixture
def mock_db_with_user():
    """
    Factory fixture to mock database lookup for a user with specific role and active status.
    """
    def _make_mock(user_id=1, username="user", role="faculty", is_active=1):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_conn.is_connected.return_value = True

        mock_cursor.fetchone.return_value = {
            "user_id": user_id,
            "username": username,
            "role": role,
            "is_active": is_active,
            "password_hash": generate_password_hash("ValidPass123!"),
            "full_name": f"User {username}",
        }
        mock_cursor.fetchall.return_value = []
        return mock_conn, mock_cursor

    return _make_mock


RBAC_PROTECTED_ENDPOINTS = [
    ("/api/copo/calculate", "routes.copo.calculate_all_student_co_attainment"),
    ("/api/predictions/generate", "routes.predictions.get_db_connection"),
    ("/api/alerts/generate", "routes.alerts.generate_co_attainment_alerts"),
]


# =============================================================================
# A. FACULTY DENIED (HTTP 403) & DOWNSTREAM LOGIC NOT REACHED
# =============================================================================
@pytest.mark.parametrize("endpoint,downstream_target", RBAC_PROTECTED_ENDPOINTS)
def test_faculty_role_denied_with_403(client, mock_db_with_user, endpoint, downstream_target):
    mock_conn, mock_cursor = mock_db_with_user(user_id=10, username="faculty_member", role="faculty", is_active=1)
    token = create_token(user_id=10, username="faculty_member", role="faculty")

    with patch("utils.auth.get_db_connection", return_value=mock_conn), \
         patch(downstream_target) as mock_downstream:
        
        res = client.post(
            endpoint,
            headers={"Authorization": f"Bearer {token}"},
            json={"dummy": "payload"}
        )

        assert res.status_code == 403
        data = res.get_json()
        assert data["status"] == "error"
        assert "Access denied: Insufficient role permissions" in data["message"]
        # Crucial security assertion: downstream privileged operation must NEVER be reached
        mock_downstream.assert_not_called()


# =============================================================================
# B. ADMIN ALLOWED (AUTHORIZATION PASSES, NOT 403)
# =============================================================================
@pytest.mark.parametrize("endpoint,downstream_target", [
    ("/api/copo/calculate", "routes.copo.calculate_all_student_co_attainment"),
    ("/api/alerts/generate", "routes.alerts.generate_co_attainment_alerts"),
])
def test_admin_role_authorized(client, mock_db_with_user, endpoint, downstream_target):
    mock_conn, mock_cursor = mock_db_with_user(user_id=1, username="admin_user", role="admin", is_active=1)
    token = create_token(user_id=1, username="admin_user", role="admin")

    with patch("utils.auth.get_db_connection", return_value=mock_conn), \
         patch("routes.copo.calculate_all_student_po_attainment", return_value={"records_written": 5}), \
         patch("routes.alerts.generate_prediction_alerts", return_value={"prediction_alerts_created": 2}), \
         patch(downstream_target, return_value={"records_written": 5, "co_alerts_created": 2}) as mock_downstream:
        
        res = client.post(
            endpoint,
            headers={"Authorization": f"Bearer {token}"},
            json={}
        )

        assert res.status_code != 401
        assert res.status_code != 403
        assert res.status_code == 200
        mock_downstream.assert_called_once()


def test_admin_role_authorized_predictions(client, mock_db_with_user):
    mock_conn, mock_cursor = mock_db_with_user(user_id=1, username="admin_user", role="admin", is_active=1)
    token = create_token(user_id=1, username="admin_user", role="admin")

    # Mock predictions DB queries
    mock_cursor.fetchall.return_value = [
        {"student_id": 1, "co_attainment": 75.0, "po_attainment": 80.0},
        {"student_id": 2, "co_attainment": 65.0, "po_attainment": 70.0}
    ]
    mock_cursor.lastrowid = 101

    with patch("utils.auth.get_db_connection", return_value=mock_conn), \
         patch("routes.predictions.get_db_connection", return_value=mock_conn):
        
        res = client.post(
            "/api/predictions/generate",
            headers={"Authorization": f"Bearer {token}"},
            json={}
        )

        assert res.status_code != 401
        assert res.status_code != 403
        assert res.status_code == 200
        data = res.get_json()
        assert data["status"] == "success"


# =============================================================================
# C. HOD ALLOWED (AUTHORIZATION PASSES, NOT 403)
# =============================================================================
@pytest.mark.parametrize("endpoint,downstream_target", [
    ("/api/copo/calculate", "routes.copo.calculate_all_student_co_attainment"),
    ("/api/alerts/generate", "routes.alerts.generate_co_attainment_alerts"),
])
def test_hod_role_authorized(client, mock_db_with_user, endpoint, downstream_target):
    mock_conn, mock_cursor = mock_db_with_user(user_id=2, username="hod_user", role="hod", is_active=1)
    token = create_token(user_id=2, username="hod_user", role="hod")

    with patch("utils.auth.get_db_connection", return_value=mock_conn), \
         patch("routes.copo.calculate_all_student_po_attainment", return_value={"records_written": 5}), \
         patch("routes.alerts.generate_prediction_alerts", return_value={"prediction_alerts_created": 2}), \
         patch(downstream_target, return_value={"records_written": 5, "co_alerts_created": 2}) as mock_downstream:
        
        res = client.post(
            endpoint,
            headers={"Authorization": f"Bearer {token}"},
            json={}
        )

        assert res.status_code != 401
        assert res.status_code != 403
        assert res.status_code == 200
        mock_downstream.assert_called_once()


def test_hod_role_authorized_predictions(client, mock_db_with_user):
    mock_conn, mock_cursor = mock_db_with_user(user_id=2, username="hod_user", role="hod", is_active=1)
    token = create_token(user_id=2, username="hod_user", role="hod")

    mock_cursor.fetchall.return_value = [
        {"student_id": 1, "co_attainment": 75.0, "po_attainment": 80.0}
    ]
    mock_cursor.lastrowid = 102

    with patch("utils.auth.get_db_connection", return_value=mock_conn), \
         patch("routes.predictions.get_db_connection", return_value=mock_conn):
        
        res = client.post(
            "/api/predictions/generate",
            headers={"Authorization": f"Bearer {token}"},
            json={}
        )

        assert res.status_code != 401
        assert res.status_code != 403
        assert res.status_code == 200


# =============================================================================
# D. AUTHENTICATION REGRESSION (UNAUTHENTICATED/INVALID TOKEN GIVES 401 NOT 403)
# =============================================================================
@pytest.mark.parametrize("endpoint,_", RBAC_PROTECTED_ENDPOINTS)
def test_anonymous_and_invalid_token_gives_401_not_403(client, endpoint, _):
    # 1. Anonymous request -> 401
    res_anon = client.post(endpoint, json={})
    assert res_anon.status_code == 401
    assert "Authorization header is required" in res_anon.get_json()["message"]

    # 2. Expired token -> 401
    expired_token = create_token(exp_delta=datetime.timedelta(hours=-2))
    res_expired = client.post(endpoint, headers={"Authorization": f"Bearer {expired_token}"})
    assert res_expired.status_code == 401
    assert "Token has expired" in res_expired.get_json()["message"]

    # 3. Invalid signature -> 401
    bad_token = create_token(secret="wrong-secret-key-at-least-32-chars-long")
    res_bad = client.post(endpoint, headers={"Authorization": f"Bearer {bad_token}"})
    assert res_bad.status_code == 401
    assert "Invalid token" in res_bad.get_json()["message"]


# =============================================================================
# E. UNKNOWN / UNEXPECTED ROLE DENIED (403)
# =============================================================================
@pytest.mark.parametrize("endpoint,_", RBAC_PROTECTED_ENDPOINTS)
def test_unknown_unexpected_role_denied(client, mock_db_with_user, endpoint, _):
    mock_conn, mock_cursor = mock_db_with_user(user_id=99, username="student_user", role="student", is_active=1)
    token = create_token(user_id=99, username="student_user", role="student")

    with patch("utils.auth.get_db_connection", return_value=mock_conn):
        res = client.post(
            endpoint,
            headers={"Authorization": f"Bearer {token}"},
            json={}
        )
        assert res.status_code == 403
        assert "Access denied: Insufficient role permissions" in res.get_json()["message"]


# =============================================================================
# F. CLIENT-CONTROLLED ROLE SPOOFING CANNOT BYPASS RBAC
# =============================================================================
@pytest.mark.parametrize("endpoint,downstream_target", RBAC_PROTECTED_ENDPOINTS)
def test_client_role_spoofing_in_body_or_query_cannot_bypass_rbac(client, mock_db_with_user, endpoint, downstream_target):
    """
    Verifies that a faculty member sending 'role=admin' in JSON body, form data,
    or query parameters cannot elevate privileges. The role in g.current_user is authoritative.
    """
    mock_conn, mock_cursor = mock_db_with_user(user_id=15, username="attacker_faculty", role="faculty", is_active=1)
    token = create_token(user_id=15, username="attacker_faculty", role="faculty")

    with patch("utils.auth.get_db_connection", return_value=mock_conn), \
         patch(downstream_target) as mock_downstream:
        
        # 1. Attempt spoofing via JSON body
        res_json = client.post(
            f"{endpoint}?role=admin",
            headers={"Authorization": f"Bearer {token}"},
            json={"role": "admin", "is_admin": True}
        )
        assert res_json.status_code == 403
        mock_downstream.assert_not_called()
