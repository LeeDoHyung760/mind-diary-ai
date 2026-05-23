import logging

from flask import Blueprint, jsonify, request

from models.emotion_kcelectra import emotion_model
from models.chat import chat_model
from ..services.music_recommendation_service import (
    extract_tags_from_emotion_result,
    recommend_music_by_tags,
)

logger = logging.getLogger(__name__)

guest_bp = Blueprint("guest", __name__)


@guest_bp.route("/chat", methods=["POST"])
def guest_chat():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()

    if not text:
        return jsonify({"error": "text is required."}), 400

    emotion_data = None
    emotion_result = {
        "label": "neutral",
        "score": 0,
    }
    tags = ["calm", "healing", "sad"]
    music_recommendations = []

    try:
        emotion_result = emotion_model.classify(text)

        emotion_data = {
            "label": emotion_result.get("label", "neutral"),
            "score": emotion_result.get("score", 0),
        }

        tags = extract_tags_from_emotion_result(emotion_result)

        ai_text = chat_model.generate(
            text,
            emotion_result.get("label", "neutral")
        )

    except Exception:
        logger.exception("AI 응답 생성 실패")
        ai_text = "죄송합니다. 일시적인 오류가 발생했습니다. 다시 말씀해 주세요."

    try:
        music_result = recommend_music_by_tags(tags, limit=4)
        music_recommendations = music_result.get("tracks", [])

    except Exception:
        logger.exception("음악 추천 생성 실패")
        music_recommendations = []

    return jsonify({
        "reply": ai_text,
        "ai_response": ai_text,
        "emotion": emotion_data,
        "tags": tags,
        "musicRecommendations": music_recommendations,
    })