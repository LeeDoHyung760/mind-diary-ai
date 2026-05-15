from bson import ObjectId

from ..repositories.chat_repository import (
    delete_chat as delete_chat_record,
    find_chats_by_user_id,
    insert_chat,
    update_chat_messages,
)
from ..utils import serialize_datetime, utc_now
from .errors import ApiError

FALLBACK_AI_TEXT = "지금은 AI 모델이 연결되어 있지 않지만, 입력한 내용은 저장되었습니다."


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
    ai_message = {
        "id": str(ObjectId()),
        "sender": "ai",
        "text": FALLBACK_AI_TEXT,
        "emotion": {},
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

        return serialize_chat(updated_chat), False

    created_chat = insert_chat(
        {
            "userId": owner_id,
            "title": _build_chat_title(message_text),
            "messages": [user_message, ai_message],
            "createdAt": now,
            "updatedAt": now,
        }
    )
    return serialize_chat(created_chat), True


def delete_chat(user_id, chat_id):
    owner_id = _parse_object_id(user_id, "user id")
    document_id = _parse_object_id(chat_id, "chat id")
    result = delete_chat_record(document_id, owner_id)

    if result.deleted_count == 0:
        raise ApiError("Chat not found.", 404)
