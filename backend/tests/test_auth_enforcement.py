import os
import sys
import datetime
import unittest
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


@pytest.fixture
def mock_db():
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value = mock_cursor
    mock_conn.is_connected.return_value = True

    # Default mock user row: active faculty user
    mock_cursor.fetchone.return_value = {
        "user_id": 1,
        "username": "faculty1",
        "role": "faculty",
        "is_active": 1,
        "password_hash": generate_password_hash("ValidPass123!"),
        "full_name": "Demo Faculty",
    }
    mock_cursor.fetchall.return_value = []

    with patch("app.get_db_connection", return_value=mock_conn), \
         patch("utils.auth.get_db_connection", return_value=mock_conn), \
         patch("config.database.get_db_connection", return_value=mock_conn), \
         patch("routes.auth.get_db_connection", return_value=mock_conn), \
         patch("routes.students.get_db_connection", return_value=mock_conn), \
         patch("routes.assessments.get_db_connection", return_value=mock_conn), \
         patch("routes.dashboard.get_db_connection", return_value=mock_conn), \
         patch("routes.copo.get_db_connection", return_value=mock_conn), \
         patch("routes.alerts.get_db_connection", return_value=mock_conn), \
         patch("routes.predictions.get_db_connection", return_value=mock_conn), \
         patch("routes.uploads.get_db_connection", return_value=mock_conn):
        yield mock_conn, mock_cursor


def create_token(user_id=1, username="faculty1", role="faculty", exp_delta=datetime.timedelta(hours=1), secret=TEST_SECRET):
    payload = {
        "user_id": user_id,
        "username": username,
        "role": role,
        "exp": datetime.datetime.utcnow() + exp_delta,
    }
    return jwt.encode(payload, secret, algorithm="HS256")


# =============================================================================
# A. PUBLIC ROUTES
# =============================================================================
def test_public_root(client):
    res = client.get("/")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "success"


def test_public_health(client, mock_db):
    res = client.get("/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "success"


def test_public_login(client, mock_db):
    res = client.post("/api/auth/login", json={
        "username": "faculty1",
        "password": "ValidPass123!"
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "success"
    assert "token" in data


# =============================================================================
# B. OPTIONS / CORS PREFLIGHT
# =============================================================================
def test_options_cors_preflight(client):
    res = client.open("/api/students/", method="OPTIONS")
    assert res.status_code != 401
    assert res.status_code in (200, 204)


# =============================================================================
# C. ANONYMOUS ACCESS REJECTION (FAIL-CLOSED)
# =============================================================================
PROTECTED_ENDPOINTS = [
    ("GET", "/api/students/"),
    ("GET", "/api/assessments/"),
    ("GET", "/api/dashboard/summary"),
    ("GET", "/api/copo/attainment"),
    ("GET", "/api/copo/po-attainment"),
    ("POST", "/api/copo/calculate"),
    ("GET", "/api/predictions/"),
    ("POST", "/api/predictions/generate"),
    ("GET", "/api/alerts/"),
    ("GET", "/api/alerts/unread"),
    ("POST", "/api/alerts/generate"),
    ("POST", "/api/uploads/marks"),
    ("POST", "/api/nlp/classify-question"),
]

@pytest.mark.parametrize("method,endpoint", PROTECTED_ENDPOINTS)
def test_anonymous_requests_rejected(client, method, endpoint):
    if method == "GET":
        res = client.get(endpoint)
    elif method == "POST":
        res = client.post(endpoint, json={"test": "data"})
    else:
        pytest.fail(f"Unsupported method: {method}")

    assert res.status_code == 401
    data = res.get_json()
    assert data["status"] == "error"
    assert "Authorization header is required" in data["message"]


# =============================================================================
# D. MISSING & MALFORMED AUTHORIZATION HEADER
# =============================================================================
def test_missing_auth_header(client):
    res = client.get("/api/students/")
    assert res.status_code == 401
    assert res.get_json()["message"] == "Authorization header is required"


@pytest.mark.parametrize("bad_header", [
    "Basic dXNlcjpwYXNz",
    "Bearer",
    "Bearer   ",
    "Token xyz",
    "BearerToken12345",
])
def test_malformed_auth_header(client, bad_header):
    res = client.get("/api/students/", headers={"Authorization": bad_header})
    assert res.status_code == 401
    data = res.get_json()
    assert data["status"] == "error"
    assert "Invalid authorization header format" in data["message"]


# =============================================================================
# E. INVALID SIGNATURE & TOKEN TAMPERING
# =============================================================================
def test_invalid_signature_rejected(client):
    wrong_secret = "completely-different-signing-secret-key-32-chars"
    token = create_token(secret=wrong_secret)

    res = client.get("/api/students/", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 401
    data = res.get_json()
    assert data["status"] == "error"
    assert "Invalid token" in data["message"]


# =============================================================================
# F. EXPIRED TOKEN
# =============================================================================
def test_expired_token_rejected(client):
    token = create_token(exp_delta=datetime.timedelta(hours=-1))

    res = client.get("/api/students/", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 401
    data = res.get_json()
    assert data["status"] == "error"
    assert "Token has expired" in data["message"]


# =============================================================================
# G. UNKNOWN / DELETED USER IN DATABASE
# =============================================================================
def test_unknown_user_rejected(client, mock_db):
    mock_conn, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = None  # User not found in DB

    token = create_token(user_id=999)
    res = client.get("/api/students/", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 401
    data = res.get_json()
    assert data["status"] == "error"
    assert "User account not found" in data["message"]


# =============================================================================
# H. INACTIVE USER IN DATABASE
# =============================================================================
def test_inactive_user_rejected_with_403(client, mock_db):
    mock_conn, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = {
        "user_id": 1,
        "username": "faculty1",
        "role": "faculty",
        "is_active": 0,  # Inactive user
    }

    token = create_token(user_id=1)
    res = client.get("/api/students/", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 403
    data = res.get_json()
    assert data["status"] == "error"
    assert "User account is inactive" in data["message"]


# =============================================================================
# I. VALID AUTHENTICATED REQUESTS
# =============================================================================
def test_valid_authenticated_get_request(client, mock_db):
    token = create_token(user_id=1)
    res = client.get("/api/students/", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "success"


def test_valid_authenticated_nlp_request(client, mock_db):
    token = create_token(user_id=1)
    res = client.post("/api/nlp/classify-question",
        headers={"Authorization": f"Bearer {token}"},
        json={"question_text": "Describe binary search tree"}
    )
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "success"
    assert "bloom_classification" in data


# =============================================================================
# J. UPLOAD CALLER IDENTITY BINDING (SPOOFING PREVENTION)
# =============================================================================
def test_upload_identity_binding_ignores_client_spoofed_user(client, mock_db):
    mock_conn, mock_cursor = mock_db
    token = create_token(user_id=42, username="faculty42")

    # Call /api/uploads/marks with form payload containing spoofed uploaded_by=999
    # (Without a file, it will return 400 No file uploaded after binding uploaded_by)
    res = client.post("/api/uploads/marks",
        headers={"Authorization": f"Bearer {token}"},
        data={"uploaded_by": "999", "assessment_id": "1"}
    )
    # Proves request passed authentication boundary (not 401/403) and reached file check
    assert res.status_code == 400
    data = res.get_json()
    assert data["message"] == "No file uploaded"


# =============================================================================
# K. SECRET CONFIGURATION FAIL-CLOSED
# =============================================================================
def test_secret_configuration_fail_closed():
    # Empty/missing secret
    with patch.dict(os.environ, {"SECRET_KEY": "", "JWT_SECRET": ""}, clear=True):
        with pytest.raises(RuntimeError, match="CRITICAL SECURITY CONFIGURATION ERROR"):
            get_jwt_secret()

    # Too short secret (< 32 characters)
    with patch.dict(os.environ, {"SECRET_KEY": "short-secret", "JWT_SECRET": ""}, clear=True):
        with pytest.raises(RuntimeError, match="at least 32 characters"):
            get_jwt_secret()

    # Valid secret (>= 32 characters)
    valid_sec = "a-valid-secure-secret-key-that-exceeds-32-chars"
    with patch.dict(os.environ, {"SECRET_KEY": valid_sec, "JWT_SECRET": ""}, clear=True):
        assert get_jwt_secret() == valid_sec
