"""
seed_all_subjects.py

Generates realistic Excel mark sheets across ALL subjects (not just CS101)
for every student enrolled in each subject, then automatically uploads each
file through your running Flask app's /api/uploads/marks route.

Run this from your `backend` folder, with your venv activated and Flask
already running in another terminal:

    python seed_all_subjects.py

Requires: pandas, openpyxl, requests, mysql-connector-python, python-dotenv
"""

import os
import random
import requests
import pandas as pd
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

FLASK_BASE_URL = "http://127.0.0.1:5000"
UPLOADED_BY = 1  # user_id of faculty1

# Question -> CO(by index 0-5) -> max_marks design per assessment_type
# CO index maps to that subject's COs in order (CO1=0, CO2=1, ... CO6=5)
ASSESSMENT_DESIGN = {
    "CAE1": [("Q1", 0, 5), ("Q2", 1, 5)],
    "CAE2": [("Q1", 1, 5), ("Q2", 2, 5)],
    "TAE1": [("Q1", 2, 5), ("Q2", 3, 5)],
    "TAE2": [("Q1", 3, 5), ("Q2", 4, 5)],
    "EndSem": [
        ("Q1", 0, 10), ("Q2", 1, 10), ("Q3", 2, 10),
        ("Q4", 3, 10), ("Q5", 4, 10), ("Q6", 5, 10),
    ],
}


def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT", 3306)),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
    )


def fetch_all_subjects(conn):
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT subject_id, subject_code, subject_name FROM subjects ORDER BY subject_id")
    rows = cursor.fetchall()
    cursor.close()
    return rows


def fetch_enrolled_students(conn, subject_id):
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """SELECT s.student_id, s.enrollment_no
           FROM students s
           JOIN student_subject_enrollment sse ON s.student_id = sse.student_id
           WHERE sse.subject_id = %s
           ORDER BY s.enrollment_no""",
        (subject_id,),
    )
    rows = cursor.fetchall()
    cursor.close()
    return rows


def fetch_assessment_ids(conn, subject_id):
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT assessment_id, assessment_type FROM assessments WHERE subject_id = %s",
        (subject_id,),
    )
    rows = cursor.fetchall()
    cursor.close()
    return {row["assessment_type"]: row["assessment_id"] for row in rows}


def fetch_co_codes(conn, subject_id):
    """Returns ordered list of co_code for this subject, e.g. ['CO1','CO2',...]"""
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT co_code FROM course_outcomes WHERE subject_id = %s ORDER BY co_id",
        (subject_id,),
    )
    rows = cursor.fetchall()
    cursor.close()
    return [r["co_code"] for r in rows]


def generate_marks_for_student(ability, questions):
    marks = []
    for _, _, max_m in questions:
        noise = random.uniform(-0.15, 0.15)
        pct = max(0.1, min(1.0, ability + noise))
        mark = round(pct * max_m, 1)
        marks.append(mark)
    return marks


def build_excel_for_assessment(assessment_type, students, student_abilities, co_codes, out_path):
    questions = ASSESSMENT_DESIGN[assessment_type]

    # Resolve CO index -> actual co_code for this subject
    resolved_questions = [(q_label, co_codes[co_idx], max_m) for q_label, co_idx, max_m in questions]

    header_q = ["Enrollment No"] + [q[0] for q in resolved_questions]
    header_co = ["(CO Mapping)"] + [q[1] for q in resolved_questions]
    header_max = ["(Max Marks)"] + [q[2] for q in resolved_questions]

    rows = [header_q, header_co, header_max]

    for student in students:
        enrollment_no = student["enrollment_no"]
        ability = student_abilities[student["student_id"]]
        marks = generate_marks_for_student(ability, resolved_questions)
        rows.append([enrollment_no] + marks)

    df = pd.DataFrame(rows)
    df.to_excel(out_path, index=False, header=False)


def upload_file(filepath, assessment_id):
    with open(filepath, "rb") as f:
        response = requests.post(
            f"{FLASK_BASE_URL}/api/uploads/marks",
            files={"file": f},
            data={"assessment_id": assessment_id, "uploaded_by": UPLOADED_BY},
        )
    try:
        return response.json()
    except Exception:
        return {"status": "error", "raw_response": response.text[:300]}


def main():
    conn = get_db_connection()
    subjects = fetch_all_subjects(conn)
    print(f"Found {len(subjects)} subjects.\n")

    random.seed(42)
    os.makedirs("seed_files", exist_ok=True)

    for subject in subjects:
        subject_id = subject["subject_id"]
        subject_code = subject["subject_code"]

        print(f"=== {subject_code} (subject_id={subject_id}) ===")

        students = fetch_enrolled_students(conn, subject_id)
        if not students:
            print("  No students enrolled, skipping.\n")
            continue

        assessment_ids = fetch_assessment_ids(conn, subject_id)
        co_codes = fetch_co_codes(conn, subject_id)

        if len(co_codes) < 6:
            print(f"  Only {len(co_codes)} COs found, expected 6. Skipping.\n")
            continue

        # Each student gets a per-subject ability (varies subject to subject, still per-student consistent-ish)
        student_abilities = {
            s["student_id"]: max(0.25, min(0.97, random.gauss(0.65, 0.18)))
            for s in students
        }

        for assessment_type in ASSESSMENT_DESIGN:
            if assessment_type not in assessment_ids:
                print(f"  Skipping {assessment_type} - not found for this subject")
                continue

            assessment_id = assessment_ids[assessment_type]
            out_path = os.path.join("seed_files", f"{subject_code}_{assessment_type}.xlsx")

            build_excel_for_assessment(assessment_type, students, student_abilities, co_codes, out_path)
            result = upload_file(out_path, assessment_id)

            print(f"  {assessment_type}: {result.get('status')}, "
                  f"inserted={result.get('records_inserted')}, "
                  f"errors={len(result.get('errors', [])) if isinstance(result.get('errors'), list) else 'n/a'}")

        print()

    conn.close()
    print("Done. Now run /api/copo/calculate, /api/predictions/generate, /api/alerts/generate.")


if __name__ == "__main__":
    main()
