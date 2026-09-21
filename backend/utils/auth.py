import os
from functools import wraps
import jwt
from flask import request, jsonify, g
from config.database import get_db_connection


def get_jwt_secret() -> str:
    """
    Retrieves the JWT signing secret from the environment (JWT_SECRET or SECRET_KEY).
    Enforces fail-closed behavior: raises a RuntimeError if the secret is missing,
    empty, or shorter than 32 characters.
    """
    secret = (os.getenv("JWT_SECRET") or os.getenv("SECRET_KEY") or "").strip()
    if not secret:
        raise RuntimeError(
            "CRITICAL SECURITY CONFIGURATION ERROR: JWT_SECRET or SECRET_KEY environment "
            "variable must be set before starting the application."
        )
    if len(secret) < 32:
        raise RuntimeError(
            "CRITICAL SECURITY CONFIGURATION ERROR: JWT_SECRET or SECRET_KEY must be at least 32 characters long."
        )
    return secret


def decode_jwt_token(token: str) -> dict:
    """
    Decodes and validates a JWT token using HS256 algorithm and the configured secret.
    """
    secret = get_jwt_secret()
    return jwt.decode(token, secret, algorithms=["HS256"])


def authenticate_request():
    """
    Authenticates an incoming request using a Bearer JWT token in the Authorization header.
    Validates token signature, expiration, user existence, and user active status in the database.
    Binds the validated user identity to flask.g.current_user upon success.
    Returns a JSON error response with appropriate status code upon failure.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return jsonify({
            "status": "error",
            "message": "Authorization header is required"
        }), 401

    parts = auth_header.strip().split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer" or not parts[1].strip():
        return jsonify({
            "status": "error",
            "message": "Invalid authorization header format. Expected 'Bearer <token>'"
        }), 401

    token = parts[1].strip()

    try:
        payload = decode_jwt_token(token)
    except jwt.ExpiredSignatureError:
        return jsonify({
            "status": "error",
            "message": "Token has expired"
        }), 401
    except jwt.InvalidTokenError:
        return jsonify({
            "status": "error",
            "message": "Invalid token"
        }), 401
    except Exception:
        return jsonify({
            "status": "error",
            "message": "Authentication failed"
        }), 401

    user_id = payload.get("user_id")
    if not user_id:
        return jsonify({
            "status": "error",
            "message": "Invalid token claims"
        }), 401

    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        query = "SELECT user_id, username, role, is_active FROM users WHERE user_id = %s"
        cursor.execute(query, (user_id,))
        user = cursor.fetchone()

        if not user:
            return jsonify({
                "status": "error",
                "message": "User account not found"
            }), 401

        if not user.get("is_active"):
            return jsonify({
                "status": "error",
                "message": "User account is inactive"
            }), 403

        g.current_user = {
            "user_id": user["user_id"],
            "username": user["username"],
            "role": user["role"]
        }
        return None

    except Exception as e:
        logging.error(f"Database error during authentication: {e}")
        return jsonify({
            "status": "error",
            "message": "Database error during authentication"
        }), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


def require_roles(*allowed_roles):
    """
    Decorator to enforce Role-Based Access Control (RBAC) on Flask endpoints.
    Verifies that the authenticated caller (g.current_user) has a role within allowed_roles.
    Returns HTTP 403 if the user does not possess an allowed role.
    Fails closed if authentication context is missing.
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            current_user = getattr(g, "current_user", None)
            if not current_user:
                return jsonify({
                    "status": "error",
                    "message": "Authentication required"
                }), 401

            user_role = current_user.get("role")
            if user_role not in allowed_roles:
                return jsonify({
                    "status": "error",
                    "message": "Access denied: Insufficient role permissions"
                }), 403

            return f(*args, **kwargs)
        return decorated_function
    return decorator
