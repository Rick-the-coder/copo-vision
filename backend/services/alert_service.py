from config.database import get_db_connection


def generate_co_attainment_alerts():
    """
    Creates an alert for every student whose CO attainment is below
    that CO's target_attainment_level.
    """
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            """SELECT ca.student_id, s.enrollment_no, ca.co_id, co.co_code,
                      ca.attainment_percentage, ca.attainment_level, co.target_attainment_level
               FROM co_attainment ca
               JOIN students s ON ca.student_id = s.student_id
               JOIN course_outcomes co ON ca.co_id = co.co_id
               WHERE ca.attainment_level < co.target_attainment_level"""
        )
        low_cos = cursor.fetchall()

        alerts_created = 0

        for row in low_cos:
            # Avoid duplicate alerts for the same student/CO combo
            cursor.execute(
                """SELECT alert_id FROM alerts 
                   WHERE student_id = %s AND co_id = %s AND alert_type = 'LOW_CO_ATTAINMENT'""",
                (row["student_id"], row["co_id"])
            )
            if cursor.fetchone():
                continue

            gap = float(row["target_attainment_level"]) - float(row["attainment_level"])
            severity = "high" if gap >= 1.5 else "medium" if gap >= 0.5 else "low"

            message = (
                f"Student {row['enrollment_no']} has low attainment in {row['co_code']}. "
                f"Attainment: {row['attainment_percentage']}% (Level {row['attainment_level']}). "
                f"Target: Level {row['target_attainment_level']}."
            )

            cursor.execute(
                """INSERT INTO alerts (student_id, alert_type, co_id, message, severity)
                   VALUES (%s, %s, %s, %s, %s)""",
                (row["student_id"], "LOW_CO_ATTAINMENT", row["co_id"], message, severity)
            )
            alerts_created += 1

        connection.commit()
        return {"co_alerts_created": alerts_created}

    finally:
        cursor.close()
        connection.close()


def generate_prediction_alerts():
    """
    Creates an alert for every student whose latest prediction status is AT_RISK.
    """
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Get the most recent prediction per student
        cursor.execute(
            """SELECT p.student_id, s.enrollment_no, p.predicted_po_attainment, p.prediction_status
               FROM predictions p
               JOIN students s ON p.student_id = s.student_id
               JOIN (
                   SELECT student_id, MAX(prediction_id) AS max_id
                   FROM predictions
                   GROUP BY student_id
               ) latest ON p.prediction_id = latest.max_id
               WHERE p.prediction_status = 'AT_RISK'"""
        )
        at_risk = cursor.fetchall()

        alerts_created = 0

        for row in at_risk:
            cursor.execute(
                """SELECT alert_id FROM alerts 
                   WHERE student_id = %s AND alert_type = 'AT_RISK_STUDENT'""",
                (row["student_id"],)
            )
            if cursor.fetchone():
                continue

            message = (
                f"Student {row['enrollment_no']} is predicted AT RISK. "
                f"Predicted PO attainment: {row['predicted_po_attainment']}%."
            )

            cursor.execute(
                """INSERT INTO alerts (student_id, alert_type, message, severity)
                   VALUES (%s, %s, %s, %s)""",
                (row["student_id"], "AT_RISK_STUDENT", message, "high")
            )
            alerts_created += 1

        connection.commit()
        return {"prediction_alerts_created": alerts_created}

    finally:
        cursor.close()
        connection.close()