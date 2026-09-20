from flask import Blueprint, jsonify
from config.database import get_db_connection

dashboard_bp = Blueprint(
    "dashboard",
    __name__,
    url_prefix="/api/dashboard"
)


@dashboard_bp.route("/summary", methods=["GET"])
def dashboard_summary():

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # Total students
        cursor.execute("""
            SELECT COUNT(*) AS total_students
            FROM students
        """)
        total_students = cursor.fetchone()["total_students"]

        # Average CO attainment
        cursor.execute("""
            SELECT ROUND(AVG(attainment_percentage), 2) AS average_co_attainment
            FROM co_attainment
        """)
        average_co = cursor.fetchone()["average_co_attainment"]

        # Average PO attainment
        cursor.execute("""
            SELECT ROUND(AVG(attainment_percentage), 2) AS average_po_attainment
            FROM po_attainment
        """)
        average_po = cursor.fetchone()["average_po_attainment"]

        # Total alerts
        cursor.execute("""
            SELECT COUNT(*) AS total_alerts
            FROM alerts
        """)
        total_alerts = cursor.fetchone()["total_alerts"]

        # High severity alerts
        cursor.execute("""
            SELECT COUNT(*) AS high_alerts
            FROM alerts
            WHERE severity = 'high'
        """)
        high_alerts = cursor.fetchone()["high_alerts"]

        # Medium severity alerts
        cursor.execute("""
            SELECT COUNT(*) AS medium_alerts
            FROM alerts
            WHERE severity = 'medium'
        """)
        medium_alerts = cursor.fetchone()["medium_alerts"]

        # Unread alerts
        cursor.execute("""
            SELECT COUNT(*) AS unread_alerts
            FROM alerts
            WHERE is_read = 0
        """)
        unread_alerts = cursor.fetchone()["unread_alerts"]

        # At-risk students
        cursor.execute("""
            SELECT COUNT(DISTINCT student_id) AS at_risk_students
            FROM alerts
            WHERE alert_type = 'AT_RISK_STUDENT'
        """)
        at_risk_students = cursor.fetchone()["at_risk_students"]

        return jsonify({
            "status": "success",
            "dashboard": {
                "total_students": total_students,
                "average_co_attainment": float(average_co or 0),
                "average_po_attainment": float(average_po or 0),
                "total_alerts": total_alerts,
                "high_alerts": high_alerts,
                "medium_alerts": medium_alerts,
                "unread_alerts": unread_alerts,
                "at_risk_students": at_risk_students
            }
        }), 200

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()