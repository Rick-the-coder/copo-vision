from flask import Blueprint, jsonify, request
from config.database import get_db_connection

students_bp = Blueprint(
    "students",
    __name__,
    url_prefix="/api/students"
)


@students_bp.route("", methods=["GET"])
@students_bp.route("/", methods=["GET"])
def get_students():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT
                s.student_id,
                s.student_id AS id,
                s.enrollment_no,
                s.enrollment_no AS roll_number,
                s.student_name,
                s.course_id,
                s.academic_year_id,
                c.course_code,
                c.course_name,
                ay.year_name
            FROM students s
            LEFT JOIN courses c
                ON s.course_id = c.course_id
            LEFT JOIN academic_years ay
                ON s.academic_year_id = ay.academic_year_id
            ORDER BY s.student_id
        """

        cursor.execute(query)
        students = cursor.fetchall()
        cursor.close()

        # Format student records with rich UI fields
        formatted = []
        for s in students:
            formatted.append({
                "id": s["student_id"],
                "student_id": s["student_id"],
                "enrollment_no": s["enrollment_no"],
                "roll_number": s["enrollment_no"],
                "student_name": s["student_name"],
                "email": f"{s['student_name'].lower().replace(' ', '.')}@copovision.edu",
                "phone": "+91 98765 12345",
                "department_id": 1,
                "course_id": s["course_id"] or 1,
                "course_name": s.get("course_name", "B.Tech CSE"),
                "semester_id": 5,
                "academic_year_id": s["academic_year_id"] or 1,
                "year_name": s.get("year_name", "2023-2024"),
                "status": True
            })

        return jsonify({
            "status": "success",
            "total_students": len(formatted),
            "students": formatted
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
    finally:
        if conn: conn.close()


@students_bp.route("", methods=["POST"])
@students_bp.route("/", methods=["POST"])
def create_student():
    conn = None
    try:
        data = request.get_json() or {}
        name = data.get("student_name", "")
        roll = data.get("roll_number") or data.get("enrollment_no", "")
        course_id = data.get("course_id", 1)
        ay_id = data.get("academic_year_id", 1)

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO students (student_name, enrollment_no, course_id, academic_year_id) VALUES (%s, %s, %s, %s)",
            (name, roll, course_id, ay_id)
        )
        conn.commit()
        new_id = cursor.lastrowid
        cursor.close()

        return jsonify({"status": "success", "id": new_id, "message": "Student created"}), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if conn: conn.close()


@students_bp.route("/<int:student_id>", methods=["PUT"])
def update_student(student_id):
    conn = None
    try:
        data = request.get_json() or {}
        name = data.get("student_name")
        roll = data.get("roll_number") or data.get("enrollment_no")

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE students SET student_name = %s, enrollment_no = %s WHERE student_id = %s",
            (name, roll, student_id)
        )
        conn.commit()
        cursor.close()

        return jsonify({"status": "success", "message": "Student updated"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if conn: conn.close()


@students_bp.route("/<int:student_id>", methods=["DELETE"])
def delete_student(student_id):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM students WHERE student_id = %s", (student_id,))
        conn.commit()
        cursor.close()

        return jsonify({"status": "success", "message": "Student deleted"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if conn: conn.close()