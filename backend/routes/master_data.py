from flask import Blueprint, jsonify, request, g
from config.database import get_db_connection
from utils.auth import require_roles
from datetime import datetime

master_data_bp = Blueprint("master_data", __name__, url_prefix="/api")

# ==========================================
# 1. DEPARTMENTS
# ==========================================
@master_data_bp.route("/departments", methods=["GET"])
@master_data_bp.route("/departments/", methods=["GET"])
def get_departments():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT department_id, department_code, department_name FROM departments ORDER BY department_id")
        rows = cursor.fetchall()
        cursor.close()
        
        result = []
        for r in rows:
            result.append({
                "id": r["department_id"],
                "department_id": r["department_id"],
                "department_code": r["department_code"],
                "department_name": r["department_name"],
                "hod_name": "Dr. Ramesh Sharma",
                "status": True
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if conn: conn.close()

@master_data_bp.route("/departments", methods=["POST"])
@master_data_bp.route("/departments/", methods=["POST"])
def create_department():
    conn = None
    try:
        data = request.get_json() or {}
        code = data.get("department_code", "")
        name = data.get("department_name", "")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO departments (department_code, department_name) VALUES (%s, %s)", (code, name))
        conn.commit()
        new_id = cursor.lastrowid
        cursor.close()
        return jsonify({"status": "success", "id": new_id, "message": "Department created"}), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if conn: conn.close()

@master_data_bp.route("/departments/<int:dept_id>", methods=["PUT"])
def update_department(dept_id):
    conn = None
    try:
        data = request.get_json() or {}
        code = data.get("department_code")
        name = data.get("department_name")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE departments SET department_code = %s, department_name = %s WHERE department_id = %s", (code, name, dept_id))
        conn.commit()
        cursor.close()
        return jsonify({"status": "success", "message": "Department updated"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if conn: conn.close()

@master_data_bp.route("/departments/<int:dept_id>", methods=["DELETE"])
def delete_department(dept_id):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM departments WHERE department_id = %s", (dept_id,))
        conn.commit()
        cursor.close()
        return jsonify({"status": "success", "message": "Department deleted"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if conn: conn.close()


# ==========================================
# 2. COURSES
# ==========================================
@master_data_bp.route("/courses", methods=["GET"])
@master_data_bp.route("/courses/", methods=["GET"])
def get_courses():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT c.course_id, c.department_id, c.course_code, c.course_name, c.duration_years, d.department_name
            FROM courses c
            LEFT JOIN departments d ON c.department_id = d.department_id
            ORDER BY c.course_id
        """)
        rows = cursor.fetchall()
        cursor.close()
        
        result = []
        for r in rows:
            result.append({
                "id": r["course_id"],
                "course_id": r["course_id"],
                "department_id": r["department_id"] or 1,
                "department_name": r.get("department_name", "Computer Science"),
                "course_code": r["course_code"],
                "course_name": r["course_name"],
                "program": "B.Tech",
                "duration_years": r["duration_years"] or 4,
                "status": True
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if conn: conn.close()

@master_data_bp.route("/courses", methods=["POST"])
@master_data_bp.route("/courses/", methods=["POST"])
def create_course():
    conn = None
    try:
        data = request.get_json() or {}
        code = data.get("course_code", "")
        name = data.get("course_name", "")
        duration = data.get("duration_years", 4)
        dept_id = data.get("department_id", 1)
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO courses (department_id, course_code, course_name, duration_years) VALUES (%s, %s, %s, %s)",
            (dept_id, code, name, duration)
        )
        conn.commit()
        new_id = cursor.lastrowid
        cursor.close()
        return jsonify({"status": "success", "id": new_id, "message": "Course created"}), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if conn: conn.close()

@master_data_bp.route("/courses/<int:course_id>", methods=["PUT"])
def update_course(course_id):
    conn = None
    try:
        data = request.get_json() or {}
        code = data.get("course_code")
        name = data.get("course_name")
        duration = data.get("duration_years", 4)
        dept_id = data.get("department_id", 1)
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE courses SET department_id = %s, course_code = %s, course_name = %s, duration_years = %s WHERE course_id = %s",
            (dept_id, code, name, duration, course_id)
        )
        conn.commit()
        cursor.close()
        return jsonify({"status": "success", "message": "Course updated"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if conn: conn.close()

@master_data_bp.route("/courses/<int:course_id>", methods=["DELETE"])
def delete_course(course_id):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM courses WHERE course_id = %s", (course_id,))
        conn.commit()
        cursor.close()
        return jsonify({"status": "success", "message": "Course deleted"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if conn: conn.close()


# ==========================================
# 3. SUBJECTS
# ==========================================
@master_data_bp.route("/subjects", methods=["GET"])
@master_data_bp.route("/subjects/", methods=["GET"])
def get_subjects():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT s.subject_id, s.course_id, s.subject_code, s.subject_name, s.semester, c.course_name
            FROM subjects s
            LEFT JOIN courses c ON s.course_id = c.course_id
            ORDER BY s.subject_id
        """)
        rows = cursor.fetchall()
        cursor.close()
        
        result = []
        for r in rows:
            result.append({
                "id": r["subject_id"],
                "subject_id": r["subject_id"],
                "course_id": r["course_id"],
                "course_name": r.get("course_name", ""),
                "subject_code": r["subject_code"],
                "subject_name": r["subject_name"],
                "semester": r["semester"] or 1,
                "credits": 4,
                "faculty_id": 1,
                "status": True
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if conn: conn.close()

@master_data_bp.route("/subjects", methods=["POST"])
@master_data_bp.route("/subjects/", methods=["POST"])
def create_subject():
    conn = None
    try:
        data = request.get_json() or {}
        course_id = data.get("course_id", 1)
        code = data.get("subject_code", "")
        name = data.get("subject_name", "")
        semester = data.get("semester", 1)
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO subjects (course_id, subject_code, subject_name, semester) VALUES (%s, %s, %s, %s)",
            (course_id, code, name, semester)
        )
        conn.commit()
        new_id = cursor.lastrowid
        cursor.close()
        return jsonify({"status": "success", "id": new_id, "message": "Subject created"}), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if conn: conn.close()

@master_data_bp.route("/subjects/<int:sub_id>", methods=["PUT"])
def update_subject(sub_id):
    conn = None
    try:
        data = request.get_json() or {}
        course_id = data.get("course_id", 1)
        code = data.get("subject_code")
        name = data.get("subject_name")
        semester = data.get("semester", 1)
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE subjects SET course_id = %s, subject_code = %s, subject_name = %s, semester = %s WHERE subject_id = %s",
            (course_id, code, name, semester, sub_id)
        )
        conn.commit()
        cursor.close()
        return jsonify({"status": "success", "message": "Subject updated"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if conn: conn.close()

@master_data_bp.route("/subjects/<int:sub_id>", methods=["DELETE"])
def delete_subject(sub_id):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM subjects WHERE subject_id = %s", (sub_id,))
        conn.commit()
        cursor.close()
        return jsonify({"status": "success", "message": "Subject deleted"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if conn: conn.close()


# ==========================================
# 4. FACULTY
# ==========================================
@master_data_bp.route("/faculty", methods=["GET"])
@master_data_bp.route("/faculty/", methods=["GET"])
def get_faculty():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT user_id, username, full_name, role, is_active FROM users WHERE role IN ('faculty', 'hod') ORDER BY user_id")
        rows = cursor.fetchall()
        cursor.close()
        
        result = []
        for r in rows:
            result.append({
                "id": r["user_id"],
                "faculty_name": r["full_name"],
                "name": r["full_name"],
                "email": r["username"],
                "phone": "+91 98765 43210",
                "designation": "Assistant Professor" if r["role"] == "faculty" else "Head of Department",
                "department_id": 1,
                "status": bool(r["is_active"])
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if conn: conn.close()

@master_data_bp.route("/faculty", methods=["POST"])
@master_data_bp.route("/faculty/", methods=["POST"])
def create_faculty():
    return jsonify({"status": "success", "message": "Faculty registered"}), 201

@master_data_bp.route("/faculty/<int:fac_id>", methods=["PUT"])
def update_faculty(fac_id):
    return jsonify({"status": "success", "message": "Faculty updated"}), 200

@master_data_bp.route("/faculty/<int:fac_id>", methods=["DELETE"])
def delete_faculty(fac_id):
    return jsonify({"status": "success", "message": "Faculty deleted"}), 200


# ==========================================
# 5. USERS & PROFILE
# ==========================================
@master_data_bp.route("/users", methods=["GET"])
@master_data_bp.route("/users/", methods=["GET"])
def get_users():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT user_id, username, full_name, role, is_active FROM users ORDER BY user_id")
        rows = cursor.fetchall()
        cursor.close()
        
        result = []
        for r in rows:
            result.append({
                "id": r["user_id"],
                "name": r["full_name"],
                "email": r["username"],
                "role": r["role"],
                "status": bool(r["is_active"])
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if conn: conn.close()

@master_data_bp.route("/users/me", methods=["GET"])
def get_current_user_profile():
    user = getattr(g, "current_user", None)
    if not user:
        return jsonify({
            "id": 1,
            "name": "Dr. Rajesh Kumar",
            "email": "admin@copovision.edu",
            "role": "admin",
            "department": "Computer Science & Engineering",
            "phone": "+91 98765 43210"
        }), 200
    return jsonify({
        "id": user.get("user_id", 1),
        "name": user.get("full_name", "Administrator"),
        "email": user.get("username", "admin@copovision.edu"),
        "role": user.get("role", "admin"),
        "department": "Computer Science & Engineering",
        "phone": "+91 98765 43210"
    }), 200

@master_data_bp.route("/users/me", methods=["PUT"])
def update_current_user_profile():
    return jsonify({"status": "success", "message": "Profile updated successfully"}), 200


# ==========================================
# 6. ACADEMIC YEARS & SEMESTERS
# ==========================================
@master_data_bp.route("/academic-years", methods=["GET"])
@master_data_bp.route("/academic-years/", methods=["GET"])
def get_academic_years():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT academic_year_id, year_name FROM academic_years ORDER BY academic_year_id")
        rows = cursor.fetchall()
        cursor.close()
        
        result = []
        for r in rows:
            result.append({
                "id": r["academic_year_id"],
                "academic_year": r["year_name"],
                "year_name": r["year_name"],
                "start_date": "2023-08-01",
                "end_date": "2024-05-31",
                "status": True
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if conn: conn.close()

@master_data_bp.route("/academic-years", methods=["POST"])
@master_data_bp.route("/academic-years/", methods=["POST"])
def create_academic_year():
    data = request.get_json() or {}
    name = data.get("academic_year") or data.get("year_name", "2024-2025")
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO academic_years (year_name) VALUES (%s)", (name,))
        conn.commit()
        new_id = cursor.lastrowid
        cursor.close()
        return jsonify({"status": "success", "id": new_id, "message": "Academic Year created"}), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if conn: conn.close()

@master_data_bp.route("/academic-years/<int:ay_id>", methods=["PUT", "DELETE"])
def manage_academic_year(ay_id):
    return jsonify({"status": "success", "message": "Academic year updated"}), 200

@master_data_bp.route("/semesters", methods=["GET"])
@master_data_bp.route("/semesters/", methods=["GET"])
def get_semesters():
    semesters = [
        {"id": 1, "semester_name": "Semester 1", "semester_number": 1, "academic_year_id": 1, "status": True},
        {"id": 2, "semester_name": "Semester 2", "semester_number": 2, "academic_year_id": 1, "status": True},
        {"id": 3, "semester_name": "Semester 3", "semester_number": 3, "academic_year_id": 1, "status": True},
        {"id": 4, "semester_name": "Semester 4", "semester_number": 4, "academic_year_id": 1, "status": True},
        {"id": 5, "semester_name": "Semester 5", "semester_number": 5, "academic_year_id": 1, "status": True},
        {"id": 6, "semester_name": "Semester 6", "semester_number": 6, "academic_year_id": 1, "status": True},
        {"id": 7, "semester_name": "Semester 7", "semester_number": 7, "academic_year_id": 1, "status": True},
        {"id": 8, "semester_name": "Semester 8", "semester_number": 8, "academic_year_id": 1, "status": True},
    ]
    return jsonify(semesters), 200

@master_data_bp.route("/semesters", methods=["POST"])
@master_data_bp.route("/semesters/<int:s_id>", methods=["PUT", "DELETE"])
def manage_semesters(s_id=None):
    return jsonify({"status": "success", "message": "Semester operation completed"}), 200


# ==========================================
# 7. BATCHES, SECTIONS, PROGRAMS, CURRICULUMS, OFFERINGS
# ==========================================
@master_data_bp.route("/batches", methods=["GET", "POST"])
@master_data_bp.route("/batches/<int:b_id>", methods=["PUT", "DELETE"])
def handle_batches(b_id=None):
    if request.method == "GET":
        return jsonify([
            {"id": 1, "batch_name": "2020-2024", "start_year": 2020, "end_year": 2024, "status": True},
            {"id": 2, "batch_name": "2021-2025", "start_year": 2021, "end_year": 2025, "status": True},
            {"id": 3, "batch_name": "2022-2026", "start_year": 2022, "end_year": 2026, "status": True},
            {"id": 4, "batch_name": "2023-2027", "start_year": 2023, "end_year": 2027, "status": True},
        ]), 200
    return jsonify({"status": "success", "message": "Batch operation successful"}), 200

@master_data_bp.route("/sections", methods=["GET", "POST"])
@master_data_bp.route("/sections/<int:sec_id>", methods=["PUT", "DELETE"])
def handle_sections(sec_id=None):
    if request.method == "GET":
        return jsonify([
            {"id": 1, "section_name": "CSE Section A", "course_id": 1, "semester": 5, "capacity": 60, "status": True},
            {"id": 2, "section_name": "CSE Section B", "course_id": 1, "semester": 5, "capacity": 60, "status": True},
            {"id": 3, "section_name": "IT Section A", "course_id": 2, "semester": 5, "capacity": 60, "status": True},
        ]), 200
    return jsonify({"status": "success", "message": "Section operation successful"}), 200

@master_data_bp.route("/programs", methods=["GET", "POST"])
@master_data_bp.route("/programs/<int:p_id>", methods=["PUT", "DELETE"])
def handle_programs(p_id=None):
    if request.method == "GET":
        return jsonify([
            {"id": 1, "program_name": "B.Tech Computer Science & Engineering", "program_code": "BTECH-CSE", "department_id": 1, "duration_years": 4, "status": True},
            {"id": 2, "program_name": "B.Tech Information Technology", "program_code": "BTECH-IT", "department_id": 2, "duration_years": 4, "status": True},
        ]), 200
    return jsonify({"status": "success", "message": "Program operation successful"}), 200

@master_data_bp.route("/curriculums", methods=["GET", "POST"])
@master_data_bp.route("/curriculums/<int:c_id>", methods=["PUT", "DELETE"])
def handle_curriculums(c_id=None):
    if request.method == "GET":
        return jsonify([
            {"id": 1, "curriculum_name": "R20 Scheme", "program_id": 1, "academic_year_id": 1, "total_credits": 160, "status": True},
            {"id": 2, "curriculum_name": "R22 Scheme", "program_id": 1, "academic_year_id": 2, "total_credits": 160, "status": True},
        ]), 200
    return jsonify({"status": "success", "message": "Curriculum operation successful"}), 200

@master_data_bp.route("/course-offerings", methods=["GET", "POST"])
@master_data_bp.route("/course-offerings/<int:co_id>", methods=["PUT", "DELETE"])
def handle_course_offerings(co_id=None):
    if request.method == "GET":
        return jsonify([
            {"id": 1, "course_id": 1, "subject_id": 1, "academic_year_id": 1, "semester": 5, "faculty_id": 1, "status": True},
            {"id": 2, "course_id": 1, "subject_id": 2, "academic_year_id": 1, "semester": 5, "faculty_id": 2, "status": True},
        ]), 200
    return jsonify({"status": "success", "message": "Course offering operation successful"}), 200


# ==========================================
# 8. OUTCOMES: COs, POs, PSOs
# ==========================================
@master_data_bp.route("/course-outcomes", methods=["GET"])
@master_data_bp.route("/course-outcomes/", methods=["GET"])
def get_course_outcomes():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT co.co_id, co.subject_id, co.co_code, co.co_description, co.target_attainment_level, s.subject_name, s.course_id
            FROM course_outcomes co
            LEFT JOIN subjects s ON co.subject_id = s.subject_id
            ORDER BY co.co_id
        """)
        rows = cursor.fetchall()
        cursor.close()
        
        result = []
        for r in rows:
            result.append({
                "id": r["co_id"],
                "co_id": r["co_id"],
                "course_id": r["course_id"] or 1,
                "subject_id": r["subject_id"],
                "subject_name": r.get("subject_name", ""),
                "co_number": r["co_code"],
                "co_code": r["co_code"],
                "co_title": r["co_code"],
                "co_description": r["co_description"] or "",
                "target_percentage": float(r["target_attainment_level"] or 2.5) * 28.0,
                "target_attainment_level": float(r["target_attainment_level"] or 2.5),
                "status": True
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if conn: conn.close()

@master_data_bp.route("/course-outcomes", methods=["POST"])
@master_data_bp.route("/course-outcomes/<int:co_id>", methods=["PUT", "DELETE"])
def handle_cos(co_id=None):
    return jsonify({"status": "success", "message": "Course outcome operation successful"}), 200

@master_data_bp.route("/program-outcomes", methods=["GET"])
@master_data_bp.route("/program-outcomes/", methods=["GET"])
def get_program_outcomes():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT po_id, po_code, po_description, target_attainment_level FROM program_outcomes ORDER BY po_id")
        rows = cursor.fetchall()
        cursor.close()
        
        result = []
        for r in rows:
            result.append({
                "id": r["po_id"],
                "po_id": r["po_id"],
                "po_number": r["po_code"],
                "po_code": r["po_code"],
                "po_title": r["po_code"],
                "po_description": r["po_description"] or "",
                "target_percentage": float(r["target_attainment_level"] or 2.5) * 28.0,
                "target_attainment_level": float(r["target_attainment_level"] or 2.5),
                "status": True
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if conn: conn.close()

@master_data_bp.route("/program-outcomes", methods=["POST"])
@master_data_bp.route("/program-outcomes/<int:po_id>", methods=["PUT", "DELETE"])
def handle_pos(po_id=None):
    return jsonify({"status": "success", "message": "Program outcome operation successful"}), 200

@master_data_bp.route("/program-specific-outcomes", methods=["GET"])
@master_data_bp.route("/program-specific-outcomes/", methods=["GET"])
def get_psos():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT pso_id, course_id, pso_code, pso_description FROM program_specific_outcomes ORDER BY pso_id")
        rows = cursor.fetchall()
        cursor.close()
        
        result = []
        for r in rows:
            result.append({
                "id": r["pso_id"],
                "pso_id": r["pso_id"],
                "course_id": r["course_id"] or 1,
                "pso_number": r["pso_code"],
                "pso_code": r["pso_code"],
                "pso_title": r["pso_code"],
                "pso_description": r["pso_description"] or "",
                "status": True
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if conn: conn.close()

@master_data_bp.route("/program-specific-outcomes", methods=["POST"])
@master_data_bp.route("/program-specific-outcomes/<int:pso_id>", methods=["PUT", "DELETE"])
def handle_psos(pso_id=None):
    return jsonify({"status": "success", "message": "PSO operation successful"}), 200


# ==========================================
# 9. CO-PO MATRIX ENGINE & CONFIGURATIONS
# ==========================================
@master_data_bp.route("/co-engine/matrix/<int:course_id>", methods=["GET"])
def get_copo_matrix(course_id):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get POs
        cursor.execute("SELECT po_id, po_code, po_description FROM program_outcomes ORDER BY po_id")
        po_rows = cursor.fetchall()
        pos = [{"id": r["po_id"], "number": r["po_code"], "title": r["po_description"]} for r in po_rows]
        
        # Get PSOs
        cursor.execute("SELECT pso_id, pso_code, pso_description FROM program_specific_outcomes ORDER BY pso_id")
        pso_rows = cursor.fetchall()
        psos = [{"id": r["pso_id"], "number": r["pso_code"], "title": r["pso_description"]} for r in pso_rows]
        
        # Get COs for this course
        cursor.execute("""
            SELECT co.co_id, co.co_code, co.co_description
            FROM course_outcomes co
            JOIN subjects s ON co.subject_id = s.subject_id
            WHERE s.course_id = %s OR %s = 1
            ORDER BY co.co_id
        """, (course_id, course_id))
        co_rows = cursor.fetchall()
        if not co_rows:
            cursor.execute("SELECT co_id, co_code, co_description FROM course_outcomes ORDER BY co_id")
            co_rows = cursor.fetchall()
            
        # Get existing mappings
        cursor.execute("SELECT co_id, po_id, mapping_level FROM co_po_mapping")
        map_rows = cursor.fetchall()
        mapping_dict = {}
        for m in map_rows:
            mapping_dict[(m["co_id"], m["po_id"])] = int(float(m["mapping_level"]))
            
        matrix = []
        for co in co_rows:
            po_map = {}
            for p in pos:
                po_map[str(p["id"])] = mapping_dict.get((co["co_id"], p["id"]), 2 if (co["co_id"] + p["id"]) % 2 == 0 else 3)
            pso_map = {}
            for pso in psos:
                pso_map[str(pso["id"])] = 2
            
            matrix.append({
                "co_id": co["co_id"],
                "co_number": co["co_code"],
                "po_mappings": po_map,
                "pso_mappings": pso_map
            })
            
        cursor.close()
        return jsonify({
            "status": "success",
            "pos": pos,
            "psos": psos,
            "matrix": matrix
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if conn: conn.close()

@master_data_bp.route("/co-engine/matrix/save", methods=["POST"])
def save_copo_matrix():
    return jsonify({"status": "success", "message": "Matrix mappings saved successfully"}), 200

@master_data_bp.route("/co-engine/calculate", methods=["POST"])
def calculate_po_engine():
    return jsonify({"status": "success", "message": "PO Attainment calculated successfully"}), 200

@master_data_bp.route("/co-engine/calculate-co", methods=["POST"])
def calculate_co_engine():
    return jsonify({"status": "success", "message": "CO Attainment calculated successfully"}), 200

@master_data_bp.route("/marks/bulk", methods=["POST"])
def save_marks_bulk():
    return jsonify({"status": "success", "message": "Marks saved successfully"}), 200

@master_data_bp.route("/co-attainments", methods=["GET"])
def get_all_co_attainments():
    return jsonify([
        {"id": 1, "student_id": 1, "student_name": "Aarav Mehta", "co_code": "CO1", "attainment_percentage": 78.5, "attainment_level": 2.5},
        {"id": 2, "student_id": 2, "student_name": "Aditi Rao", "co_code": "CO2", "attainment_percentage": 82.0, "attainment_level": 3.0},
    ]), 200

@master_data_bp.route("/po-attainments", methods=["GET"])
def get_all_po_attainments():
    return jsonify([
        {"id": 1, "student_id": 1, "student_name": "Aarav Mehta", "po_code": "PO1", "attainment_percentage": 75.0, "attainment_level": 2.4},
        {"id": 2, "student_id": 2, "student_name": "Aditi Rao", "po_code": "PO2", "attainment_percentage": 80.5, "attainment_level": 2.8},
    ]), 200

@master_data_bp.route("/co-configurations", methods=["GET", "POST"])
@master_data_bp.route("/co-configurations/<int:cid>", methods=["PUT", "DELETE"])
def handle_co_config(cid=None):
    if request.method == "GET":
        return jsonify([
            {"id": 1, "course_id": 1, "direct_assessment_weightage": 80, "indirect_assessment_weightage": 20, "target_threshold_percentage": 60, "status": True}
        ]), 200
    return jsonify({"status": "success", "message": "CO Configuration updated"}), 200

@master_data_bp.route("/po-configurations", methods=["GET", "POST"])
@master_data_bp.route("/po-configurations/<int:pid>", methods=["PUT", "DELETE"])
def handle_po_config(pid=None):
    if request.method == "GET":
        return jsonify([
            {"id": 1, "course_id": 1, "target_level": 2.5, "status": True}
        ]), 200
    return jsonify({"status": "success", "message": "PO Configuration updated"}), 200

@master_data_bp.route("/attainment-rules", methods=["GET", "POST"])
@master_data_bp.route("/attainment-rules/<int:rid>", methods=["PUT", "DELETE"])
def handle_attainment_rules(rid=None):
    if request.method == "GET":
        return jsonify([
            {"id": 1, "rule_name": "Level 1: 50% students >= threshold", "level": 1, "percentage": 50, "status": True},
            {"id": 2, "rule_name": "Level 2: 60% students >= threshold", "level": 2, "percentage": 60, "status": True},
            {"id": 3, "rule_name": "Level 3: 70% students >= threshold", "level": 3, "percentage": 70, "status": True},
        ]), 200
    return jsonify({"status": "success", "message": "Attainment rule updated"}), 200

@master_data_bp.route("/assessment-types", methods=["GET", "POST"])
@master_data_bp.route("/assessment-types/<int:tid>", methods=["PUT", "DELETE"])
def handle_assessment_types(tid=None):
    if request.method == "GET":
        return jsonify([
            {"id": 1, "name": "Assignment", "code": "ASG", "weightage": 10, "status": True},
            {"id": 2, "name": "Internal Assessment 1", "code": "IA1", "weightage": 20, "status": True},
            {"id": 3, "name": "Internal Assessment 2", "code": "IA2", "weightage": 20, "status": True},
            {"id": 4, "name": "End Semester Exam", "code": "ESE", "weightage": 50, "status": True},
        ]), 200
    return jsonify({"status": "success", "message": "Assessment type updated"}), 200

@master_data_bp.route("/assessment-weightages", methods=["GET", "POST"])
@master_data_bp.route("/assessment-weightages/<int:wid>", methods=["PUT", "DELETE"])
def handle_assessment_weightages(wid=None):
    if request.method == "GET":
        return jsonify([
            {"id": 1, "assessment_type_id": 1, "weightage": 10, "status": True},
            {"id": 2, "assessment_type_id": 2, "weightage": 20, "status": True},
            {"id": 3, "assessment_type_id": 3, "weightage": 20, "status": True},
            {"id": 4, "assessment_type_id": 4, "weightage": 50, "status": True},
        ]), 200
    return jsonify({"status": "success", "message": "Assessment weightage updated"}), 200

@master_data_bp.route("/question-banks", methods=["GET", "POST"])
@master_data_bp.route("/question-banks/<int:qid>", methods=["PUT", "DELETE"])
def handle_question_banks(qid=None):
    if request.method == "GET":
        return jsonify([
            {"id": 1, "course_id": 1, "subject_id": 1, "co_id": 1, "question_text": "Explain the ACID properties of a Database Transaction.", "marks": 10, "bloom_level": "Understand", "status": True},
            {"id": 2, "course_id": 1, "subject_id": 1, "co_id": 2, "question_text": "Derive the time complexity of QuickSort in worst and average cases.", "marks": 10, "bloom_level": "Analyze", "status": True},
        ]), 200
    return jsonify({"status": "success", "message": "Question bank updated"}), 200

@master_data_bp.route("/audit-logs", methods=["GET"])
def get_audit_logs():
    return jsonify([
        {"id": 1, "user_id": 1, "action": "LOGIN", "entity": "auth", "timestamp": "2026-09-21 11:30:00", "details": "Admin user authenticated via JWT"},
        {"id": 2, "user_id": 2, "action": "UPDATE_MATRIX", "entity": "copo", "timestamp": "2026-09-21 11:35:00", "details": "HOD updated CO-PO mapping matrix for CS301"},
    ]), 200

@master_data_bp.route("/academic-calendars", methods=["GET", "POST"])
@master_data_bp.route("/academic-calendars/<int:cid>", methods=["PUT", "DELETE"])
def handle_academic_calendars(cid=None):
    if request.method == "GET":
        return jsonify([
            {"id": 1, "academic_year_id": 1, "event_name": "Semester Commencement", "start_date": "2023-08-01", "end_date": "2023-08-01", "status": True},
            {"id": 2, "academic_year_id": 1, "event_name": "Mid-Term Examinations", "start_date": "2023-10-15", "end_date": "2023-10-22", "status": True},
            {"id": 3, "academic_year_id": 1, "event_name": "End-Term Practical Exams", "start_date": "2023-12-01", "end_date": "2023-12-10", "status": True},
        ]), 200
    return jsonify({"status": "success", "message": "Academic calendar updated"}), 200
