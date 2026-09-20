from flask import Blueprint, jsonify
from config.database import get_db_connection

students_bp = Blueprint(
    "students",
    __name__,
    url_prefix="/api/students"
)


@students_bp.route("/", methods=["GET"])
def get_students():

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                s.student_id,
                s.enrollment_no,
                s.student_name,
                c.course_code,
                c.course_name,
                ay.year_name
            FROM students s
            JOIN courses c
                ON s.course_id = c.course_id
            JOIN academic_years ay
                ON s.academic_year_id = ay.academic_year_id
            ORDER BY s.student_id
        """

        cursor.execute(query)
        students = cursor.fetchall()

        cursor.close()
        connection.close()

        return jsonify({
            "status": "success",
            "total_students": len(students),
            "students": students
        }), 200

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500