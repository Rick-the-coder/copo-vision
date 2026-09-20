from flask import Flask, jsonify
from flask_cors import CORS

from config.database import get_db_connection

from routes.auth import auth_bp
from routes.students import students_bp
from routes.assessments import assessments_bp
from routes.copo import copo_bp
from routes.alerts import alerts_bp
from routes.dashboard import dashboard_bp
from routes.predictions import predictions_bp
from routes.uploads import uploads_bp
from routes.nlp import nlp_bp


# ==========================================
# CREATE FLASK APPLICATION
# ==========================================

app = Flask(__name__)

# Allow React frontend to communicate with Flask
CORS(app)


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

    except Exception as e:

        return jsonify({
            "status": "error",
            "database": "connection failed",
            "message": str(e)
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