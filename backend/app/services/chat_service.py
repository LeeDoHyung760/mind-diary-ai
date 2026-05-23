import logging

from bson import ObjectId

from models.emotion_kcelectra import emotion_model
from models.chat import chat_model

from ..repositories.chat_repository import (
    delete_chat as delete_chat_record,
    find_chats_by_user_id,
    insert_chat,
    update_chat_messages,
)
from ..utils import serialize_datetime, utc_now
from .errors import ApiError
from .music_recommendation_service import (
    extract_tags_from_emotion_result,
    recommend_music_by_tags,
)

logger = logging.getLogger(__name__)


def _serialize_message(message):
    serialized = {
        "id": message.get("id"),
        "sender": message.get("sender"),
        "text": message.get("text"),
        "createdAt": serialize_datetime(message.get("createdAt")),
    }

    if "emotion" in message:
        serialized["emotion"] = message.get("emotion")

    return serialized


def _build_chat_title(text):
    compact = " ".join(str(text or "").split())
    return compact[:24] if compact else "New chat"


def _resolve_chat_title(document):
    first_user_message = next(
        (message for message in document.get("messages", []) if message.get("sender") == "user"),
        None,
    )

    if first_user_message and first_user_message.get("text"):
        return _build_chat_title(first_user_message.get("text"))

    return _build_chat_title(document.get("title"))


def serialize_chat(document):
    return {
        "id": str(document["_id"]),
        "userId": str(document["userId"]),
        "title": _resolve_chat_title(document),
        "messages": [_serialize_message(message) for message in document.get("messages", [])],
        "createdAt": serialize_datetime(document.get("createdAt")),
        "updatedAt": serialize_datetime(document.get("updatedAt")),
    }


def _parse_object_id(value, field_name):
    try:
        return ObjectId(value)
    except Exception as exc:
        raise ApiError(f"Invalid {field_name}.", 400) from exc


def list_user_chats(user_id):
    owner_id = _parse_object_id(user_id, "user id")
    return [serialize_chat(document) for document in find_chats_by_user_id(owner_id)]


def append_chat_message(user_id, payload):
    message_text = (payload.get("text") or "").strip()
    chat_id = (payload.get("chatId") or "").strip()

    if not message_text:
        raise ApiError("text is required.", 400)

    owner_id = _parse_object_id(user_id, "user id")
    now = utc_now()

    user_message = {
        "id": str(ObjectId()),
        "sender": "user",
        "text": message_text,
        "createdAt": now,
    }

    emotion_result = {
        "label": "neutral",
        "score": 0,
    }

    tags = ["calm", "healing", "sad"]
    music_recommendations = []

    try:
        emotion_result = emotion_model.classify(message_text)
        tags = extract_tags_from_emotion_result(emotion_result)
        ai_text = chat_model.generate(message_text, emotion_result.get("label", "neutral"))

    except Exception:
        logger.exception("AI 응답 생성 실패")
        ai_text = "죄송합니다. 일시적인 오류가 발생했습니다. 다시 말씀해 주세요."

    try:
        music_result = recommend_music_by_tags(tags, limit=4)
        music_recommendations = music_result.get("tracks", [])

    except Exception:
        logger.exception("음악 추천 생성 실패")
        music_recommendations = []

    ai_message = {
        "id": str(ObjectId()),
        "sender": "ai",
        "text": ai_text,
        "emotion": emotion_result,
        "createdAt": now,
    }

    if chat_id:
        updated_chat = update_chat_messages(
            _parse_object_id(chat_id, "chat id"),
            owner_id,
            [user_message, ai_message],
            now,
        )

        if updated_chat is None:
            raise ApiError("Chat not found.", 404)

        response = {
            "chat": serialize_chat(updated_chat),
            "emotion": emotion_result,
            "tags": tags,
            "musicRecommendations": music_recommendations,
        }

        return response, False

    created_chat = insert_chat(
        {
            "userId": owner_id,
            "title": _build_chat_title(message_text),
            "messages": [user_message, ai_message],
            "createdAt": now,
            "updatedAt": now,
        }
    )

    response = {
        "chat": serialize_chat(created_chat),
        "emotion": emotion_result,
        "tags": tags,
        "musicRecommendations": music_recommendations,
    }

    return response, True


def delete_chat(user_id, chat_id):
    owner_id = _parse_object_id(user_id, "user id")
    document_id = _parse_object_id(chat_id, "chat id")
    result = delete_chat_record(document_id, owner_id)

    if result.deleted_count == 0:
        raise ApiError("Chat not found.", 404)