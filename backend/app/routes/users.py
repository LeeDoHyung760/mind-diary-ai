from flask import Blueprint, jsonify, request

from ..services.errors import ApiError
from ..services.user_service import (
    create_onboarding_profile,
    get_user_profile,
    update_user_profile,
)

users_bp = Blueprint("users", __name__)


@users_bp.post("/onboarding")
def create_onboarding_profile_route():
    payload = request.get_json(silent=True) or {}

    try:
        user = create_onboarding_profile(payload)
        return jsonify({"user": user}), 201
    except ApiError as error:
        return jsonify({"message": error.message}), error.status_code


@users_bp.get("/<user_id>")
def get_user_profile_route(user_id):
    try:
        user = get_user_profile(user_id)
        return jsonify({"user": user})
    except ApiError as error:
        return jsonify({"message": error.message}), error.status_code


@users_bp.patch("/<user_id>/profile")
def update_user_profile_route(user_id):
    payload = request.get_json(silent=True) or {}

    try:
        user = update_user_profile(user_id, payload)
        return jsonify({"user": user})
    except ApiError as error:
        return jsonify({"message": error.message}), error.status_code
