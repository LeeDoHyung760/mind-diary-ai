import logging

from flask import Blueprint, jsonify, request

from models.emotion_kcelectra import emotion_model
from models.chat import chat_model

logger = logging.getLogger(__name__)

guest_bp = Blueprint("guest", __name__)


@guest_bp.route("/chat", methods=["POST"])
def guest_chat():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()

    if not text:
        return jsonify({"error": "text is required."}), 400

    emotion_data = None
    try:
        emotion_result = emotion_model.classify(text)
        ai_text = chat_model.generate(text, emotion_result["label"])
        emotion_data = {
            "label": emotion_result["label"],
            "score": emotion_result["score"],
        }
    except Exception:
        logger.exception("AI 응답 생성 실패")
        ai_text = "죄송합니다. 일시적인 오류가 발생했습니다. 다시 말씀해 주세요."

    return jsonify({"reply": ai_text, "emotion": emotion_data})
