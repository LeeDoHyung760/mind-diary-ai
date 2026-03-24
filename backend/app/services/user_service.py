from bson import ObjectId

from ..repositories.user_repository import find_user_by_id, insert_user, update_user_by_id
from ..utils import serialize_datetime, utc_now
from .errors import ApiError


def serialize_profile(document):
    return {
        "id": str(document["_id"]),
        "socialProvider": document.get("socialProvider"),
        "socialId": document.get("socialId"),
        "email": document.get("email"),
        "nickname": document.get("nickname"),
        "assistantName": document.get("assistantName"),
        "avatarStyle": document.get("avatarStyle"),
        "themeColor": document.get("themeColor"),
        "isOnboardingCompleted": document.get("isOnboardingCompleted", False),
        "createdAt": serialize_datetime(document.get("createdAt")),
        "updatedAt": serialize_datetime(document.get("updatedAt")),
    }


def _parse_user_id(user_id):
    try:
        return ObjectId(user_id)
    except Exception as exc:
        raise ApiError("Invalid user id.", 400) from exc


def create_onboarding_profile(payload):
    assistant_name = (payload.get("assistantName") or "").strip()
    avatar_style = (payload.get("avatarStyle") or "").strip()
    theme_color = (payload.get("themeColor") or "").strip()

    if not assistant_name:
        raise ApiError("assistantName is required.", 400)

    if not avatar_style:
        raise ApiError("avatarStyle is required.", 400)

    if not theme_color:
        raise ApiError("themeColor is required.", 400)

    now = utc_now()
    document = {
        "socialProvider": payload.get("socialProvider", "pending"),
        "socialId": payload.get("socialId", "pending-social-id"),
        "email": payload.get("email"),
        "nickname": payload.get("nickname"),
        "assistantName": assistant_name,
        "avatarStyle": avatar_style,
        "themeColor": theme_color,
        "isOnboardingCompleted": True,
        "createdAt": now,
        "updatedAt": now,
    }
    return serialize_profile(insert_user(document))


def get_user_profile(user_id):
    document = find_user_by_id(_parse_user_id(user_id))

    if document is None:
        raise ApiError("User not found.", 404)

    return serialize_profile(document)


def update_user_profile(user_id, payload):
    updates = {}

    for source, target in (
        ("assistantName", "assistantName"),
        ("avatarStyle", "avatarStyle"),
        ("themeColor", "themeColor"),
    ):
        value = payload.get(source)
        if isinstance(value, str) and value.strip():
            updates[target] = value.strip()

    if not updates:
        raise ApiError("No profile fields to update.", 400)

    updates["isOnboardingCompleted"] = True
    updates["updatedAt"] = utc_now()
    updated_user = update_user_by_id(_parse_user_id(user_id), updates)

    if updated_user is None:
        raise ApiError("User not found.", 404)

    return serialize_profile(updated_user)
