from datetime import timedelta
from jose import jwt, JWTError, ExpiredSignatureError
from pydantic import ValidationError
import pytest
from app.core.config import Settings
from app.core import security


def test_valid_secret_key_configuration():
    """Explicitly provided strong SECRET_KEY succeeds."""
    test_key = "a" * 32
    cfg = Settings(SECRET_KEY=test_key, _env_file=None)
    assert cfg.SECRET_KEY == test_key


def test_missing_secret_key_fails_fast(monkeypatch):
    """Missing SECRET_KEY must fail fast and not use any silent fallback."""
    monkeypatch.delenv("SECRET_KEY", raising=False)
    with pytest.raises(ValidationError) as exc_info:
        Settings(_env_file=None)
    errors = exc_info.value.errors()
    assert any(err["loc"] == ("SECRET_KEY",) for err in errors)


@pytest.mark.parametrize("placeholder", [
    "supersecretkey_please_change_in_production",
    "your-secret-key-here",
    "your-super-secret-jwt-key",
    "secret",
    "changeme",
])
def test_insecure_placeholder_secret_key_rejected(placeholder):
    """Known insecure placeholder values must be rejected during configuration loading."""
    with pytest.raises(ValidationError) as exc_info:
        Settings(SECRET_KEY=placeholder, _env_file=None)
    error_str = str(exc_info.value)
    assert "Insecure SECRET_KEY detected" in error_str


@pytest.mark.parametrize("empty_val", ["", "   ", "\t\n"])
def test_empty_or_whitespace_secret_key_rejected(empty_val):
    """Empty or whitespace-only SECRET_KEY values must be rejected."""
    with pytest.raises(ValidationError) as exc_info:
        Settings(SECRET_KEY=empty_val, _env_file=None)
    error_str = str(exc_info.value)
    assert "SECRET_KEY cannot be empty" in error_str


def test_short_secret_key_rejected():
    """Overly short secret keys (< 16 characters) must be rejected."""
    with pytest.raises(ValidationError) as exc_info:
        Settings(SECRET_KEY="short_key_123", _env_file=None)
    error_str = str(exc_info.value)
    assert "at least 16 characters long" in error_str


def test_jwt_creation_and_verification():
    """JWT created with security service can be decoded with the configured SECRET_KEY."""
    subject = "user_42"
    token = security.create_access_token(subject=subject, expires_delta=timedelta(minutes=15))
    assert isinstance(token, str)

    payload = jwt.decode(token, security.settings.SECRET_KEY, algorithms=[security.ALGORITHM])
    assert payload["sub"] == subject
    assert "exp" in payload


def test_jwt_rejected_with_different_key():
    """JWT signed with one key must be rejected when verified against a different key."""
    token = security.create_access_token(subject="user_99")
    wrong_key = "completely-different-signing-key-32-chars"
    with pytest.raises(JWTError):
        jwt.decode(token, wrong_key, algorithms=[security.ALGORITHM])


def test_jwt_expired_token_rejected():
    """Expired JWTs must raise ExpiredSignatureError / JWTError."""
    expired_token = security.create_access_token(
        subject="user_expired",
        expires_delta=timedelta(minutes=-10)
    )
    with pytest.raises(ExpiredSignatureError):
        jwt.decode(expired_token, security.settings.SECRET_KEY, algorithms=[security.ALGORITHM])


def test_jwt_tampered_payload_rejected():
    """Tampered token signatures or payloads must be rejected."""
    token = security.create_access_token(subject="user_genuine")
    # Tamper with the last few signature characters
    tampered_token = token[:-5] + "XXXXX"
    with pytest.raises(JWTError):
        jwt.decode(tampered_token, security.settings.SECRET_KEY, algorithms=[security.ALGORITHM])


def test_password_hashing_and_verification():
    """Password hashing and verification utilities continue to operate correctly."""
    plain = "MySecurePassword123!"
    hashed = security.get_password_hash(plain)
    assert hashed != plain
    assert security.verify_password(plain, hashed) is True
    assert security.verify_password("WrongPassword", hashed) is False
