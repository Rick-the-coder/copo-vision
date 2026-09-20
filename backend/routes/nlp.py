from flask import Blueprint, request, jsonify
from services.nlp_classifier import classify_bloom_level, suggest_co_mapping

nlp_bp = Blueprint(
    "nlp",
    __name__,
    url_prefix="/api/nlp"
)


@nlp_bp.route("/classify-question", methods=["POST"])
def classify_question():
    data = request.get_json()

    if not data or "question_text" not in data:
        return jsonify({"status": "error", "message": "question_text is required"}), 400

    question_text = data["question_text"]
    subject_id = data.get("subject_id")

    bloom_result = classify_bloom_level(question_text)

    response = {
        "status": "success",
        "question_text": question_text,
        "bloom_classification": bloom_result
    }

    if subject_id:
        co_result = suggest_co_mapping(question_text, subject_id)
        response["co_suggestion"] = co_result

    return jsonify(response), 200