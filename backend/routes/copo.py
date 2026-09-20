from flask import Blueprint, jsonify
from config.database import get_db_connection
from services.attainment import calculate_all_student_co_attainment, calculate_all_student_po_attainment

copo_bp = Blueprint(
    "copo",
    __name__,
    url_prefix="/api/copo"
)


@copo_bp.route("/attainment", methods=["GET"])
def get_co_attainment():
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                ca.co_attainment_id, ca.student_id, s.enrollment_no, s.student_name,
                ca.co_id, co.co_code, ca.attainment_percentage, ca.attainment_level
            FROM co_attainment ca
            JOIN students s ON ca.student_id = s.student_id
            JOIN course_outcomes co ON ca.co_id = co.co_id
            ORDER BY ca.student_id, ca.co_id
        """
        cursor.execute(query)
        records = cursor.fetchall()

        cursor.close()
        connection.close()

        return jsonify({"status": "success", "total_records": len(records), "attainment": records}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@copo_bp.route("/po-attainment", methods=["GET"])
def get_po_attainment():
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                pa.po_attainment_id, pa.student_id, s.enrollment_no, s.student_name,
                pa.po_id, pa.attainment_percentage, pa.attainment_level
            FROM po_attainment pa
            JOIN students s ON pa.student_id = s.student_id
            ORDER BY pa.student_id, pa.po_id
        """
        cursor.execute(query)
        records = cursor.fetchall()

        cursor.close()
        connection.close()

        return jsonify({"status": "success", "total_records": len(records), "attainment": records}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@copo_bp.route("/calculate", methods=["POST"])
def calculate_attainment():
    try:
        co_result = calculate_all_student_co_attainment()
        po_result = calculate_all_student_po_attainment()

        return jsonify({
            "status": "success",
            "co_records_written": co_result["records_written"],
            "po_records_written": po_result["records_written"]
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500