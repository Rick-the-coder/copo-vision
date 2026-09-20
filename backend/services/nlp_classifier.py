import re
from config.database import get_db_connection

BLOOM_VERBS = {
    "Knowledge": ["define", "list", "state", "recall", "name", "identify", "label", "outline"],
    "Comprehension": ["explain", "describe", "summarize", "summarise", "discuss", "classify", "interpret"],
    "Application": ["apply", "solve", "demonstrate", "use", "calculate", "implement", "illustrate", "compute"],
    "Analysis": ["analyze", "analyse", "differentiate", "compare", "examine", "investigate", "distinguish"],
    "Synthesis": ["design", "construct", "develop", "formulate", "create", "propose", "compose", "devise"],
    "Evaluation": ["evaluate", "assess", "justify", "critique", "recommend", "argue", "defend"],
}


def classify_bloom_level(question_text):
    """
    Scans question text for Bloom's taxonomy signal verbs.
    Returns the matched level with highest specificity (later levels
    in the hierarchy win on tie, since they indicate deeper cognitive demand).
    """
    text_lower = question_text.lower()

    level_order = ["Knowledge", "Comprehension", "Application", "Analysis", "Synthesis", "Evaluation"]
    matched_levels = []

    for level in level_order:
        for verb in BLOOM_VERBS[level]:
            # Word boundary match so "analyze" doesn't match inside "analyzed" oddly, etc.
            if re.search(r"\b" + re.escape(verb) + r"\w*\b", text_lower):
                matched_levels.append(level)
                break

    if not matched_levels:
        return {
            "predicted_level": "Unknown",
            "confidence": "low",
            "matched_verbs": [],
            "note": "No Bloom's taxonomy signal verb detected. Consider rephrasing with an action verb (e.g., 'explain', 'analyze', 'design')."
        }

    # Prefer the highest-order level found (deepest cognitive demand present)
    predicted_level = matched_levels[-1] if len(matched_levels) == 1 else max(
        matched_levels, key=lambda lvl: level_order.index(lvl)
    )

    # Collect which verbs actually matched, for transparency
    matched_verbs = []
    for verb in BLOOM_VERBS[predicted_level]:
        if re.search(r"\b" + re.escape(verb) + r"\w*\b", text_lower):
            matched_verbs.append(verb)

    confidence = "high" if len(matched_levels) == 1 else "medium"

    return {
        "predicted_level": predicted_level,
        "confidence": confidence,
        "matched_verbs": matched_verbs,
        "all_signals_found": matched_levels
    }


def suggest_co_mapping(question_text, subject_id):
    """
    Very lightweight CO suggestion: matches keywords in the question
    against each CO's description for the given subject, using simple
    word-overlap scoring.
    """
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT co_id, co_code, co_description FROM course_outcomes WHERE subject_id = %s",
            (subject_id,)
        )
        cos = cursor.fetchall()

        if not cos:
            return {"suggested_co": None, "note": "No COs found for this subject"}

        question_words = set(re.findall(r"\b[a-z]{4,}\b", question_text.lower()))

        best_co = None
        best_score = 0

        for co in cos:
            co_words = set(re.findall(r"\b[a-z]{4,}\b", co["co_description"].lower()))
            overlap = len(question_words & co_words)

            if overlap > best_score:
                best_score = overlap
                best_co = co

        if not best_co or best_score == 0:
            return {"suggested_co": None, "note": "No strong keyword overlap found with any CO"}

        return {
            "suggested_co": best_co["co_code"],
            "co_id": best_co["co_id"],
            "match_score": best_score
        }

    finally:
        cursor.close()
        connection.close()