from flask import Blueprint, jsonify
from config.database import get_db_connection

import numpy as np
from sklearn.linear_model import LinearRegression


predictions_bp = Blueprint(
    "predictions",
    __name__,
    url_prefix="/api/predictions"
)


@predictions_bp.route("/generate", methods=["POST"])
def generate_predictions():

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # Get average CO and PO attainment for every student
        query = """
            SELECT
                s.student_id,
                AVG(ca.attainment_percentage) AS co_attainment,
                AVG(pa.attainment_percentage) AS po_attainment
            FROM students s
            LEFT JOIN co_attainment ca
                ON s.student_id = ca.student_id
            LEFT JOIN po_attainment pa
                ON s.student_id = pa.student_id
            GROUP BY s.student_id
            ORDER BY s.student_id
        """

        cursor.execute(query)
        students = cursor.fetchall()

        if not students:
            return jsonify({
                "status": "error",
                "message": "No student attainment data found"
            }), 404

        # ------------------------------------------
        # Prepare ML data
        # ------------------------------------------

        co_values = []
        po_values = []

        for student in students:

            co = float(student["co_attainment"] or 0)
            po = float(student["po_attainment"] or 0)

            co_values.append(co)
            po_values.append(po)

        X = np.array(co_values).reshape(-1, 1)
        y = np.array(po_values)

        # ------------------------------------------
        # Train Linear Regression model
        # ------------------------------------------

        model = LinearRegression()
        model.fit(X, y)

        # Model score
        accuracy = model.score(X, y) * 100

        # ------------------------------------------
        # Store model information
        # ------------------------------------------

        cursor.execute("""
            INSERT INTO prediction_models
            (
                model_name,
                algorithm,
                version,
                accuracy
            )
            VALUES
            (
                %s,
                %s,
                %s,
                %s
            )
        """, (
            "CO-PO Attainment Predictor",
            "Linear Regression",
            "1.0",
            round(accuracy, 2)
        ))

        model_id = cursor.lastrowid

        # ------------------------------------------
        # Generate predictions
        # ------------------------------------------

        prediction_records = []

        for student in students:

            student_id = student["student_id"]

            current_co = float(
                student["co_attainment"] or 0
            )

            predicted_po = float(
                model.predict(
                    np.array([[current_co]])
                )[0]
            )

            # Keep prediction within 0-100
            predicted_po = max(
                0,
                min(100, predicted_po)
            )

            predicted_co = current_co

            if predicted_po >= 75:
                status = "GOOD"

            elif predicted_po >= 60:
                status = "AVERAGE"

            else:
                status = "AT_RISK"

            cursor.execute("""
                INSERT INTO predictions
                (
                    student_id,
                    model_id,
                    predicted_co_attainment,
                    predicted_po_attainment,
                    prediction_status
                )
                VALUES
                (
                    %s,
                    %s,
                    %s,
                    %s,
                    %s
                )
            """, (
                student_id,
                model_id,
                round(predicted_co, 2),
                round(predicted_po, 2),
                status
            ))

            prediction_records.append({
                "student_id": student_id,
                "predicted_co_attainment": round(
                    predicted_co, 2
                ),
                "predicted_po_attainment": round(
                    predicted_po, 2
                ),
                "prediction_status": status
            })

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Predictions generated successfully",
            "model": {
                "model_id": model_id,
                "algorithm": "Linear Regression",
                "accuracy": round(accuracy, 2)
            },
            "total_predictions": len(
                prediction_records
            ),
            "predictions": prediction_records
        }), 200

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


@predictions_bp.route("/", methods=["GET"])
def get_predictions():

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                p.prediction_id,
                p.student_id,
                s.enrollment_no,
                s.student_name,
                p.model_id,
                p.predicted_co_attainment,
                p.predicted_po_attainment,
                p.prediction_status,
                p.predicted_at
            FROM predictions p
            JOIN students s
                ON p.student_id = s.student_id
            ORDER BY p.prediction_id DESC
        """

        cursor.execute(query)
        predictions = cursor.fetchall()

        return jsonify({
            "status": "success",
            "total_predictions": len(predictions),
            "predictions": predictions
        }), 200

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()