from flask import Blueprint, jsonify, redirect, request

from ..services.auth_service import (
    get_google_login_url,
    get_kakao_login_url,
    get_naver_login_url,
    handle_google_callback,
    handle_kakao_callback,
    handle_naver_callback,
)

auth_bp = Blueprint("auth", __name__)


@auth_bp.get("/kakao/login")
def kakao_login():
    client_id, redirect_url = get_kakao_login_url()

    if not client_id:
        return jsonify({"message": "KAKAO_CLIENT_ID is not configured."}), 500

    return redirect(redirect_url)


@auth_bp.get("/kakao/callback")
def kakao_callback():
    return redirect(handle_kakao_callback(request.args))


@auth_bp.get("/naver/login")
def naver_login():
    client_id, redirect_url = get_naver_login_url()

    if not client_id:
        return jsonify({"message": "NAVER_CLIENT_ID is not configured."}), 500

    return redirect(redirect_url)


@auth_bp.get("/naver/callback")
def naver_callback():
    return redirect(handle_naver_callback(request.args))


@auth_bp.get("/google/login")
def google_login():
    client_id, redirect_url = get_google_login_url()

    if not client_id:
        return jsonify({"message": "GOOGLE_CLIENT_ID is not configured."}), 500

    return redirect(redirect_url)


@auth_bp.get("/google/callback")
def google_callback():
    return redirect(handle_google_callback(request.args))
