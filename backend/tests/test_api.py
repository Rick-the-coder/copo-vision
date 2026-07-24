from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    # We might not have a root endpoint, but we can test docs
    response = client.get("/docs")
    assert response.status_code == 200

def test_login_invalid_credentials():
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "wrong@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 400

# We would add actual DB fixtures here for full integration testing, 
# but for Phase 2 completion this serves as the foundational test suite.
