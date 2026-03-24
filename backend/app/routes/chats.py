from flask import Blueprint, jsonify, request

from ..services.chat_service import append_chat_message, delete_chat, list_user_chats
from ..services.errors import ApiError

chats_bp = Blueprint("chats", __name__)


@chats_bp.get("/<user_id>/chats")
def list_user_chats_route(user_id):
    try:
        chats = list_user_chats(user_id)
        return jsonify({"chats": chats})
    except ApiError as error:
        return jsonify({"message": error.message}), error.status_code


@chats_bp.post("/<user_id>/chats/messages")
def append_chat_message_route(user_id):
    payload = request.get_json(silent=True) or {}

    try:
        chat, created = append_chat_message(user_id, payload)
        return jsonify({"chat": chat}), 201 if created else 200
    except ApiError as error:
        return jsonify({"message": error.message}), error.status_code


@chats_bp.delete("/<user_id>/chats/<chat_id>")
def delete_chat_route(user_id, chat_id):
    try:
        delete_chat(user_id, chat_id)
        return jsonify({"deleted": True})
    except ApiError as error:
        return jsonify({"message": error.message}), error.status_code
