from bson import ObjectId
from flask import Blueprint, jsonify, request
from pymongo import ReturnDocument

from ..db import get_db
from ..utils import utc_now

users_bp = Blueprint("users", __name__)


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
        "createdAt": document.get("createdAt").isoformat() if document.get("createdAt") else None,
        "updatedAt": document.get("updatedAt").isoformat() if document.get("updatedAt") else None,
    }


@users_bp.post("/onboarding")
def create_onboarding_profile():
    payload = request.get_json(silent=True) or {}
    assistant_name = (payload.get("assistantName") or "").strip()
    avatar_style = (payload.get("avatarStyle") or "").strip()
    theme_color = (payload.get("themeColor") or "").strip()

    if not assistant_name:
        return jsonify({"message": "assistantName은 필수입니다."}), 400

    if not avatar_style:
        return jsonify({"message": "avatarStyle은 필수입니다."}), 400

    if not theme_color:
        return jsonify({"message": "themeColor는 필수입니다."}), 400

    db = get_db()
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

    inserted = db.users.insert_one(document)
    created = db.users.find_one({"_id": inserted.inserted_id})
    return jsonify({"user": serialize_profile(created)}), 201


@users_bp.get("/<user_id>")
def get_user_profile(user_id):
    db = get_db()

    try:
        document = db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return jsonify({"message": "유효하지 않은 사용자 ID입니다."}), 400

    if document is None:
        return jsonify({"message": "사용자를 찾을 수 없습니다."}), 404

    return jsonify({"user": serialize_profile(document)})


@users_bp.patch("/<user_id>/profile")
def update_user_profile(user_id):
    payload = request.get_json(silent=True) or {}
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
        return jsonify({"message": "업데이트할 값이 없습니다."}), 400

    updates["isOnboardingCompleted"] = True
    updates["updatedAt"] = utc_now()
    db = get_db()

    try:
        result = db.users.find_one_and_update(
            {"_id": ObjectId(user_id)},
            {"$set": updates},
            return_document=ReturnDocument.AFTER,
        )
    except Exception:
        return jsonify({"message": "유효하지 않은 사용자 ID입니다."}), 400

    if result is None:
        return jsonify({"message": "사용자를 찾을 수 없습니다."}), 404

    return jsonify({"user": serialize_profile(result)})
