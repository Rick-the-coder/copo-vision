from flask import Blueprint, jsonify
from config.database import get_db_connection

assessments_bp = Blueprint(
    "assessments",
    __name__,
    url_prefix="/api/assessments"
)


@assessments_bp.route("/", methods=["GET"])
def get_assessments():

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                a.assessment_id,
                a.assessment_name,
                a.assessment_type,
                a.max_marks,
                a.assessment_date,
                s.subject_id,
                s.subject_code,
                s.subject_name
            FROM assessments a
            JOIN subjects s
                ON a.subject_id = s.subject_id
            ORDER BY a.assessment_id
        """

        cursor.execute(query)
        assessments = cursor.fetchall()

        cursor.close()
        connection.close()

        return jsonify({
            "status": "success",
            "total_assessments": len(assessments),
            "assessments": assessments
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500