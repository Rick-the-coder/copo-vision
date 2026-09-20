"""
seed_test_marks.py

Generates realistic Excel mark sheets for CS101 (subject_id=1) across all 5
assessments (CAE1, CAE2, TAE1, TAE2, EndSem) for every student enrolled in
that subject, then automatically uploads each file through your running
Flask app's /api/uploads/marks route.

Run this from your `backend` folder, with your venv activated and Flask
already running in another terminal:

    python seed_test_marks.py

Requires: pandas, openpyxl, requests, mysql-connector-python, python-dotenv
(you should already have all of these installed)
"""

import os
import random
import requests
import pandas as pd
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

FLASK_BASE_URL = "http://127.0.0.1:5000"
SUBJECT_ID = 1  # CS101 - Quantum Computing
UPLOADED_BY = 1  # user_id of faculty1

# Question -> CO -> max_marks design per assessment_type
ASSESSMENT_DESIGN = {
    "CAE1": [("Q1", "CO1", 5), ("Q2", "CO2", 5)],
    "CAE2": [("Q1", "CO2", 5), ("Q2", "CO3", 5)],
    "TAE1": [("Q1", "CO3", 5), ("Q2", "CO4", 5)],
    "TAE2": [("Q1", "CO4", 5), ("Q2", "CO5", 5)],
    "EndSem": [
        ("Q1", "CO1", 10), ("Q2", "CO2", 10), ("Q3", "CO3", 10),
        ("Q4", "CO4", 10), ("Q5", "CO5", 10), ("Q6", "CO6", 10),
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


def fetch_enrolled_students(conn):
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """SELECT s.student_id, s.enrollment_no
           FROM students s
           JOIN student_subject_enrollment sse ON s.student_id = sse.student_id
           WHERE sse.subject_id = %s
           ORDER BY s.enrollment_no""",
        (SUBJECT_ID,),
    )
    rows = cursor.fetchall()
    cursor.close()
    return rows


def fetch_assessment_ids(conn):
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT assessment_id, assessment_type FROM assessments WHERE subject_id = %s",
        (SUBJECT_ID,),
    )
    rows = cursor.fetchall()
    cursor.close()
    return {row["assessment_type"]: row["assessment_id"] for row in rows}


def generate_marks_for_student(ability, questions):
    """ability: 0-1 float representing student's general skill level."""
    marks = []
    for _, _, max_m in questions:
        # ability influences the score, plus some random noise
        noise = random.uniform(-0.15, 0.15)
        pct = max(0.1, min(1.0, ability + noise))
        mark = round(pct * max_m, 1)
        marks.append(mark)
    return marks


def build_excel_for_assessment(assessment_type, students, student_abilities, out_path):
    questions = ASSESSMENT_DESIGN[assessment_type]

    header_q = ["Enrollment No"] + [q[0] for q in questions]
    header_co = ["(CO Mapping)"] + [q[1] for q in questions]
    header_max = ["(Max Marks)"] + [q[2] for q in questions]

    rows = [header_q, header_co, header_max]

    for student in students:
        enrollment_no = student["enrollment_no"]
        ability = student_abilities[student["student_id"]]
        marks = generate_marks_for_student(ability, questions)
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
    return response.json()


def main():
    conn = get_db_connection()

    students = fetch_enrolled_students(conn)
    if not students:
        print("No students enrolled in subject_id =", SUBJECT_ID)
        return

    assessment_ids = fetch_assessment_ids(conn)
    print(f"Found {len(students)} students, assessments: {assessment_ids}")

    conn.close()

    # Assign each student a random but consistent "ability" level
    random.seed(42)
    student_abilities = {
        s["student_id"]: random.uniform(0.35, 0.95) for s in students
    }

    os.makedirs("seed_files", exist_ok=True)

    for assessment_type, questions in ASSESSMENT_DESIGN.items():
        if assessment_type not in assessment_ids:
            print(f"Skipping {assessment_type} - not found in assessments table")
            continue

        assessment_id = assessment_ids[assessment_type]
        out_path = os.path.join("seed_files", f"{assessment_type}.xlsx")

        print(f"Generating {out_path} for assessment_id={assessment_id} ...")
        build_excel_for_assessment(assessment_type, students, student_abilities, out_path)

        print(f"Uploading {assessment_type} ...")
        result = upload_file(out_path, assessment_id)
        print(f"  -> {result.get('status')}, records_inserted={result.get('records_inserted')}, errors={len(result.get('errors', []))}")

    print("\nDone. Now run /api/copo/calculate to recompute attainment from this real data.")


if __name__ == "__main__":
    main()
