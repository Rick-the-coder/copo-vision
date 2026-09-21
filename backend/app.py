from flask import Flask, jsonify, request
from flask_cors import CORS

from config.database import get_db_connection
from utils.auth import authenticate_request

from routes.auth import auth_bp
from routes.students import students_bp
from routes.assessments import assessments_bp
from routes.copo import copo_bp
from routes.alerts import alerts_bp
from routes.dashboard import dashboard_bp
from routes.predictions import predictions_bp
from routes.uploads import uploads_bp
from routes.nlp import nlp_bp
from routes.master_data import master_data_bp
from routes.analytics import analytics_bp
from routes.ml import ml_bp


# ==========================================
# CREATE FLASK APPLICATION
# ==========================================

app = Flask(__name__)

# Allow React frontend to communicate with Flask
CORS(app)


# ==========================================
# GLOBAL AUTHENTICATION MIDDLEWARE
# ==========================================

PUBLIC_ROUTES = {
    "/",
    "/health",
    "/api/auth/login",
}

@app.before_request
def enforce_authentication():
    # Allow CORS preflight requests
    if request.method == "OPTIONS":
        return None

    # Normalize path (strip trailing slash if length > 1)
    normalized_path = request.path.rstrip("/") if len(request.path) > 1 else request.path

    if normalized_path in PUBLIC_ROUTES or request.path in PUBLIC_ROUTES:
        return None

    return authenticate_request()


# ==========================================
# REGISTER API BLUEPRINTS
# ==========================================

app.register_blueprint(auth_bp)
app.register_blueprint(students_bp)
app.register_blueprint(assessments_bp)
app.register_blueprint(copo_bp)
app.register_blueprint(alerts_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(predictions_bp)
app.register_blueprint(uploads_bp)
app.register_blueprint(nlp_bp)
app.register_blueprint(master_data_bp)
app.register_blueprint(analytics_bp)
app.register_blueprint(ml_bp)


# ==========================================
# HOME / BACKEND STATUS
# ==========================================

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "COPO-Vision Backend is running",
        "status": "success"
    }), 200


# ==========================================
# DATABASE HEALTH CHECK
# ==========================================

@app.route("/health", methods=["GET"])
def health():

    connection = None

    try:
        connection = get_db_connection()

        if connection.is_connected():

            return jsonify({
                "status": "success",
                "database": "connected"
            }), 200

        return jsonify({
            "status": "error",
            "database": "not connected"
        }), 500

    except Exception:
        return jsonify({
            "status": "error",
            "database": "connection failed",
            "message": "Database connection failed"
        }), 500

    finally:

        if connection:
            connection.close()


# ==========================================
# START FLASK SERVER
# ==========================================

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )