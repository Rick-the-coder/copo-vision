import os
import pandas as pd
from flask import Blueprint, request, jsonify
from config.database import get_db_connection

uploads_bp = Blueprint(
    "uploads",
    __name__,
    url_prefix="/api/uploads"
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def parse_marks_excel(filepath):
    raw = pd.read_excel(filepath, header=None)

    question_cols = raw.iloc[0, 1:].tolist()
    co_mapping = raw.iloc[1, 1:].tolist()
    max_marks = raw.iloc[2, 1:].tolist()

    student_data = raw.iloc[3:, :].copy()
    student_data.columns = ["enrollment_no"] + question_cols
    student_data = student_data.reset_index(drop=True)

    return question_cols, co_mapping, max_marks, student_data


@uploads_bp.route("/marks", methods=["POST"])
def upload_marks():

    if "file" not in request.files:
        return jsonify({"status": "error", "message": "No file uploaded"}), 400

    file = request.files["file"]
    assessment_id = request.form.get("assessment_id")
    uploaded_by = request.form.get("uploaded_by")

    if not assessment_id:
        return jsonify({"status": "error", "message": "assessment_id is required"}), 400

    if not file.filename.endswith((".xlsx", ".xls")):
        return jsonify({"status": "error", "message": "File must be .xlsx or .xls"}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    connection = None
    cursor = None
    upload_id = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            "INSERT INTO upload_batches (file_name, uploaded_by, status) VALUES (%s, %s, 'processing')",
            (file.filename, uploaded_by)
        )
        connection.commit()
        upload_id = cursor.lastrowid

        question_cols, co_mapping, max_marks, student_data = parse_marks_excel(filepath)

        cursor.execute("SELECT subject_id FROM assessments WHERE assessment_id = %s", (assessment_id,))
        assessment_row = cursor.fetchone()
        if not assessment_row:
            raise ValueError(f"assessment_id {assessment_id} not found")
        subject_id = assessment_row["subject_id"]

        cursor.execute("SELECT co_id, co_code FROM course_outcomes WHERE subject_id = %s", (subject_id,))
        valid_cos = {row["co_code"]: row["co_id"] for row in cursor.fetchall()}

        invalid_cos = [co for co in set(co_mapping) if co not in valid_cos]
        if invalid_cos:
            raise ValueError(f"CO codes not found for this subject: {invalid_cos}")

        co_total_marks = {}
        for co_code, marks in zip(co_mapping, max_marks):
            co_total_marks[co_code] = co_total_marks.get(co_code, 0) + float(marks)

        assessment_co_ids = {}
        for co_code, total_marks in co_total_marks.items():
            co_id = valid_cos[co_code]

            cursor.execute(
                "SELECT assessment_co_id FROM assessment_co_mapping WHERE assessment_id = %s AND co_id = %s",
                (assessment_id, co_id)
            )
            existing = cursor.fetchone()

            if existing:
                assessment_co_ids[co_code] = existing["assessment_co_id"]
                cursor.execute(
                    "UPDATE assessment_co_mapping SET max_marks_for_co = %s WHERE assessment_co_id = %s",
                    (total_marks, existing["assessment_co_id"])
                )
            else:
                cursor.execute(
                    "INSERT INTO assessment_co_mapping (assessment_id, co_id, max_marks_for_co) VALUES (%s, %s, %s)",
                    (assessment_id, co_id, total_marks)
                )
                assessment_co_ids[co_code] = cursor.lastrowid

        connection.commit()

        row_errors = []
        records_inserted = 0

        for idx, row in student_data.iterrows():
            enrollment_no = str(row["enrollment_no"]).strip()

            cursor.execute("SELECT student_id FROM students WHERE enrollment_no = %s", (enrollment_no,))
            student_row = cursor.fetchone()

            if not student_row:
                row_errors.append(f"Row {idx + 4}: enrollment_no '{enrollment_no}' not found")
                continue

            student_id = student_row["student_id"]

            for q_col, co_code, max_m in zip(question_cols, co_mapping, max_marks):
                mark_val = row[q_col]

                if pd.isna(mark_val):
                    row_errors.append(f"Row {idx + 4}, {q_col}: missing mark")
                    continue

                mark_val = float(mark_val)
                if mark_val > float(max_m):
                    row_errors.append(f"Row {idx + 4}, {q_col}: mark {mark_val} exceeds max {max_m}")
                    continue

                assessment_co_id = assessment_co_ids[co_code]

                cursor.execute(
                    "SELECT mark_id FROM student_marks WHERE student_id = %s AND assessment_co_id = %s",
                    (student_id, assessment_co_id)
                )
                if cursor.fetchone():
                    continue

                cursor.execute(
                    "INSERT INTO student_marks (student_id, assessment_co_id, marks_obtained) VALUES (%s, %s, %s)",
                    (student_id, assessment_co_id, mark_val)
                )
                records_inserted += 1

        connection.commit()

        cursor.execute(
            "UPDATE upload_batches SET status = 'completed', records_processed = %s WHERE upload_id = %s",
            (records_inserted, upload_id)
        )
        connection.commit()

        return jsonify({
            "status": "success",
            "records_inserted": records_inserted,
            "errors": row_errors
        }), 200

    except Exception as e:
        if connection:
            connection.rollback()
            if upload_id and cursor:
                try:
                    cursor.execute(
                        "UPDATE upload_batches SET status = 'failed' WHERE upload_id = %s",
                        (upload_id,)
                    )
                    connection.commit()
                except Exception:
                    pass

        return jsonify({"status": "error", "message": str(e)}), 400

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()