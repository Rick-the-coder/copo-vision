from config.database import get_db_connection


def level_from_percentage(pct):
    if pct >= 70:
        return 3.0
    elif pct >= 60:
        return 2.0
    elif pct >= 50:
        return 1.0
    else:
        return 0.0


def calculate_all_student_co_attainment():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute("SELECT student_id FROM students")
        students = [r["student_id"] for r in cursor.fetchall()]

        cursor.execute("SELECT co_id FROM course_outcomes")
        all_cos = [r["co_id"] for r in cursor.fetchall()]

        records_written = 0

        for student_id in students:
            for co_id in all_cos:
                cursor.execute(
                    """SELECT sm.marks_obtained, acm.max_marks_for_co
                       FROM student_marks sm
                       JOIN assessment_co_mapping acm ON sm.assessment_co_id = acm.assessment_co_id
                       WHERE sm.student_id = %s AND acm.co_id = %s""",
                    (student_id, co_id)
                )
                rows = cursor.fetchall()

                if not rows:
                    continue

                total_obtained = sum(float(r["marks_obtained"]) for r in rows)
                total_max = sum(float(r["max_marks_for_co"]) for r in rows)

                if total_max == 0:
                    continue

                pct = (total_obtained / total_max) * 100
                level = level_from_percentage(pct)

                cursor.execute(
                    "SELECT co_attainment_id FROM co_attainment WHERE student_id = %s AND co_id = %s",
                    (student_id, co_id)
                )
                existing = cursor.fetchone()

                if existing:
                    cursor.execute(
                        "UPDATE co_attainment SET attainment_percentage = %s, attainment_level = %s WHERE co_attainment_id = %s",
                        (round(pct, 2), level, existing["co_attainment_id"])
                    )
                else:
                    cursor.execute(
                        "INSERT INTO co_attainment (student_id, co_id, attainment_percentage, attainment_level) VALUES (%s, %s, %s, %s)",
                        (student_id, co_id, round(pct, 2), level)
                    )

                records_written += 1

        connection.commit()
        return {"records_written": records_written}

    finally:
        cursor.close()
        connection.close()


def calculate_all_student_po_attainment():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute("SELECT student_id FROM students")
        students = [r["student_id"] for r in cursor.fetchall()]

        cursor.execute("SELECT po_id FROM program_outcomes")
        all_pos = [r["po_id"] for r in cursor.fetchall()]

        records_written = 0

        for student_id in students:
            for po_id in all_pos:
                cursor.execute(
                    "SELECT cpm.co_id, cpm.mapping_level FROM co_po_mapping cpm WHERE cpm.po_id = %s",
                    (po_id,)
                )
                mappings = cursor.fetchall()

                if not mappings:
                    continue

                weighted_sum = 0
                weight_total = 0

                for m in mappings:
                    co_id = m["co_id"]
                    strength = float(m["mapping_level"])

                    cursor.execute(
                        "SELECT attainment_percentage FROM co_attainment WHERE student_id = %s AND co_id = %s",
                        (student_id, co_id)
                    )
                    co_row = cursor.fetchone()

                    if not co_row:
                        continue

                    co_pct = float(co_row["attainment_percentage"])
                    weighted_sum += strength * co_pct
                    weight_total += strength

                if weight_total == 0:
                    continue

                po_pct = weighted_sum / weight_total
                level = level_from_percentage(po_pct)

                cursor.execute(
                    "SELECT po_attainment_id FROM po_attainment WHERE student_id = %s AND po_id = %s",
                    (student_id, po_id)
                )
                existing = cursor.fetchone()

                if existing:
                    cursor.execute(
                        "UPDATE po_attainment SET attainment_percentage = %s, attainment_level = %s WHERE po_attainment_id = %s",
                        (round(po_pct, 2), level, existing["po_attainment_id"])
                    )
                else:
                    cursor.execute(
                        "INSERT INTO po_attainment (student_id, po_id, attainment_percentage, attainment_level) VALUES (%s, %s, %s, %s)",
                        (student_id, po_id, round(po_pct, 2), level)
                    )

                records_written += 1

        connection.commit()
        return {"records_written": records_written}

    finally:
        cursor.close()
        connection.close()