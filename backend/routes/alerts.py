from flask import Blueprint, jsonify
from config.database import get_db_connection
from services.alert_service import generate_co_attainment_alerts, generate_prediction_alerts

alerts_bp = Blueprint(
    "alerts",
    __name__,
    url_prefix="/api/alerts"
)


@alerts_bp.route("/", methods=["GET"])
def get_alerts():
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                a.alert_id, a.student_id, s.enrollment_no, s.student_name,
                a.faculty_id, a.alert_type, a.co_id, a.po_id,
                a.message, a.severity, a.is_read, a.created_at
            FROM alerts a
            JOIN students s ON a.student_id = s.student_id
            ORDER BY a.alert_id DESC
        """
        cursor.execute(query)
        alerts = cursor.fetchall()

        cursor.close()
        connection.close()

        return jsonify({"status": "success", "total_alerts": len(alerts), "alerts": alerts}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@alerts_bp.route("/unread", methods=["GET"])
def get_unread_alerts():
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                a.alert_id, a.student_id, s.enrollment_no, s.student_name,
                a.alert_type, a.co_id, a.po_id, a.message, a.severity, a.created_at
            FROM alerts a
            JOIN students s ON a.student_id = s.student_id
            WHERE a.is_read = 0
            ORDER BY a.alert_id DESC
        """
        cursor.execute(query)
        alerts = cursor.fetchall()

        cursor.close()
        connection.close()

        return jsonify({"status": "success", "total_unread": len(alerts), "alerts": alerts}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@alerts_bp.route("/generate", methods=["POST"])
def generate_alerts():
    try:
        co_result = generate_co_attainment_alerts()
        pred_result = generate_prediction_alerts()

        return jsonify({
            "status": "success",
            "co_alerts_created": co_result["co_alerts_created"],
            "prediction_alerts_created": pred_result["prediction_alerts_created"]
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500