import jwt
import datetime
from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from config.database import get_db_connection
from utils.auth import get_jwt_secret

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({
            "status": "error",
            "message": "Username and password are required"
        }), 400

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT user_id, username, password_hash,
                   full_name, role, is_active
            FROM users
            WHERE username = %s
        """

        cursor.execute(query, (username,))
        user = cursor.fetchone()

        cursor.close()
        connection.close()

        if not user:
            return jsonify({"status": "error", "message": "Invalid username or password"}), 401

        if not user["is_active"]:
            return jsonify({"status": "error", "message": "Account is inactive"}), 403

        if not check_password_hash(user["password_hash"], password):
            return jsonify({"status": "error", "message": "Invalid username or password"}), 401

        # Issue a JWT token, valid for 8 hours
        token_payload = {
            "user_id": user["user_id"],
            "username": user["username"],
            "role": user["role"],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=8)
        }
        secret_key = get_jwt_secret()
        token = jwt.encode(token_payload, secret_key, algorithm="HS256")

        return jsonify({
            "status": "success",
            "message": "Login successful",
            "token": token,
            "user": {
                "user_id": user["user_id"],
                "username": user["username"],
                "full_name": user["full_name"],
                "role": user["role"]
            }
        }), 200

    except Exception:
        return jsonify({"status": "error", "message": "An error occurred during authentication"}), 500