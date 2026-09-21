from flask import Blueprint, jsonify, request
from config.database import get_db_connection

assessments_bp = Blueprint(
    "assessments",
    __name__,
    url_prefix="/api/assessments"
)


@assessments_bp.route("", methods=["GET"])
@assessments_bp.route("/", methods=["GET"])
def get_assessments():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT
                a.assessment_id,
                a.assessment_id AS id,
                a.assessment_name,
                a.assessment_type,
                a.max_marks,
                a.assessment_date,
                s.subject_id,
                s.subject_code,
                s.subject_name,
                s.course_id
            FROM assessments a
            LEFT JOIN subjects s
                ON a.subject_id = s.subject_id
            ORDER BY a.assessment_id
        """

        cursor.execute(query)
        assessments = cursor.fetchall()
        cursor.close()

        formatted = []
        for a in assessments:
            max_m = float(a["max_marks"] or 100)
            formatted.append({
                "id": a["assessment_id"],
                "assessment_id": a["assessment_id"],
                "assessment_name": a["assessment_name"],
                "assessment_type": a["assessment_type"],
                "assessment_type_id": 1 if "assign" in (a["assessment_type"] or "").lower() else 2,
                "course_id": a.get("course_id") or 1,
                "subject_id": a["subject_id"] or 1,
                "subject_name": a.get("subject_name", ""),
                "semester_id": 5,
                "academic_year_id": 1,
                "faculty_id": 1,
                "schedule_date": str(a["assessment_date"]) if a["assessment_date"] else "2024-03-15",
                "maximum_marks": max_m,
                "max_marks": max_m,
                "passing_marks": max_m * 0.4,
                "weightage": 20,
                "status": True
            })

        return jsonify({
            "status": "success",
            "total_assessments": len(formatted),
            "assessments": formatted
        }), 200

    except Exception:
        return jsonify({
            "status": "error",
            "message": "Failed to retrieve assessments"
        }), 500
    finally:
        if conn: conn.close()


@assessments_bp.route("", methods=["POST"])
@assessments_bp.route("/", methods=["POST"])
def create_assessment():
    conn = None
    try:
        data = request.get_json() or {}
        name = data.get("assessment_name", "Assessment")
        atype = data.get("assessment_type", "Exam")
        sub_id = data.get("subject_id", 1)
        max_marks = data.get("maximum_marks") or data.get("max_marks", 100)
        date = data.get("schedule_date") or data.get("assessment_date", "2024-03-15")

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO assessments (subject_id, assessment_name, assessment_type, max_marks, assessment_date) VALUES (%s, %s, %s, %s, %s)",
            (sub_id, name, atype, max_marks, date)
        )
        conn.commit()
        new_id = cursor.lastrowid
        cursor.close()

        return jsonify({"status": "success", "id": new_id, "message": "Assessment created"}), 201
    except Exception:
        return jsonify({"status": "error", "message": "Failed to create assessment"}), 500
    finally:
        if conn: conn.close()


@assessments_bp.route("/<int:assessment_id>", methods=["PUT"])
def update_assessment(assessment_id):
    conn = None
    try:
        data = request.get_json() or {}
        name = data.get("assessment_name")
        max_marks = data.get("maximum_marks") or data.get("max_marks")

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE assessments SET assessment_name = %s, max_marks = %s WHERE assessment_id = %s",
            (name, max_marks, assessment_id)
        )
        conn.commit()
        cursor.close()

        return jsonify({"status": "success", "message": "Assessment updated"}), 200
    except Exception:
        return jsonify({"status": "error", "message": "Failed to update assessment"}), 500
    finally:
        if conn: conn.close()


@assessments_bp.route("/<int:assessment_id>", methods=["DELETE"])
def delete_assessment(assessment_id):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM assessments WHERE assessment_id = %s", (assessment_id,))
        conn.commit()
        cursor.close()

        return jsonify({"status": "success", "message": "Assessment deleted"}), 200
    except Exception:
        return jsonify({"status": "error", "message": "Failed to delete assessment"}), 500
    finally:
        if conn: conn.close()