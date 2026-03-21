from urllib.parse import urlencode

import requests
from flask import Blueprint, current_app, jsonify, redirect, request
from pymongo import ReturnDocument

from ..db import get_db
from ..utils import utc_now

auth_bp = Blueprint("auth", __name__)


def build_frontend_redirect(path, **params):
    query = urlencode({key: value for key, value in params.items() if value is not None})
    base = f"{current_app.config['FRONTEND_URL']}{path}"
    return f"{base}?{query}" if query else base


def sanitize_detail(detail):
    if not detail:
        return None

    text = str(detail).strip().replace("\n", " ")
    return text[:220]


def log_auth_error(provider, step, detail=None):
    current_app.logger.error("[%s] %s failed: %s", provider, step, sanitize_detail(detail) or "unknown")


def upsert_social_user(provider, social_id, email, nickname, profile_image=None):
    db = get_db()
    now = utc_now()

    return db.users.find_one_and_update(
        {"socialProvider": provider, "socialId": social_id},
        {
            "$set": {
                "socialProvider": provider,
                "socialId": social_id,
                "email": email,
                "nickname": nickname,
                "profileImage": profile_image,
                "updatedAt": now,
            },
            "$setOnInsert": {
                "assistantName": "마음이",
                "avatarStyle": "gold",
                "themeColor": "#fcc14c",
                "isOnboardingCompleted": False,
                "createdAt": now,
            },
        },
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )


def redirect_with_user(provider, user):
    return redirect(
        build_frontend_redirect(
            f"/auth/{provider}/callback",
            userId=str(user["_id"]),
            onboarding="true" if not user.get("isOnboardingCompleted") else "false",
        )
    )


def redirect_with_error(provider, error_code, reason=None):
    return redirect(
        build_frontend_redirect(
            f"/auth/{provider}/callback",
            error=error_code,
            reason=sanitize_detail(reason),
        )
    )


@auth_bp.get("/kakao/login")
def kakao_login():
    client_id = current_app.config["KAKAO_CLIENT_ID"]
    redirect_uri = current_app.config["KAKAO_REDIRECT_URI"]

    if not client_id:
        return jsonify({"message": "KAKAO_CLIENT_ID가 설정되지 않았습니다."}), 500

    params = urlencode(
        {
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
        }
    )
    return redirect(f"https://kauth.kakao.com/oauth/authorize?{params}")


@auth_bp.get("/kakao/callback")
def kakao_callback():
    code = request.args.get("code")
    provider_error = request.args.get("error")
    provider_description = request.args.get("error_description")

    if provider_error:
        log_auth_error("kakao", "provider_callback", f"{provider_error} {provider_description}")
        return redirect_with_error("kakao", provider_error, provider_description)

    if not code:
        return redirect_with_error("kakao", "kakao_code_missing")

    token_response = requests.post(
        "https://kauth.kakao.com/oauth/token",
        data={
            "grant_type": "authorization_code",
            "client_id": current_app.config["KAKAO_CLIENT_ID"],
            "client_secret": current_app.config["KAKAO_CLIENT_SECRET"],
            "redirect_uri": current_app.config["KAKAO_REDIRECT_URI"],
            "code": code,
        },
        timeout=10,
    )

    if not token_response.ok:
        log_auth_error("kakao", "token_exchange", token_response.text)
        return redirect_with_error("kakao", "kakao_token_exchange_failed", token_response.text)

    access_token = token_response.json().get("access_token")
    profile_response = requests.get(
        "https://kapi.kakao.com/v2/user/me",
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=10,
    )

    if not profile_response.ok:
        log_auth_error("kakao", "profile_fetch", profile_response.text)
        return redirect_with_error("kakao", "kakao_profile_fetch_failed", profile_response.text)

    profile = profile_response.json()
    account = profile.get("kakao_account", {})
    profile_data = account.get("profile", {})

    user = upsert_social_user(
        provider="kakao",
        social_id=str(profile.get("id")),
        email=account.get("email"),
        nickname=profile_data.get("nickname") or "마음 사용자",
        profile_image=profile_data.get("profile_image_url"),
    )

    return redirect_with_user("kakao", user)


@auth_bp.get("/naver/login")
def naver_login():
    client_id = current_app.config["NAVER_CLIENT_ID"]
    redirect_uri = current_app.config["NAVER_REDIRECT_URI"]
    state = current_app.config["NAVER_STATE"]

    if not client_id:
        return jsonify({"message": "NAVER_CLIENT_ID가 설정되지 않았습니다."}), 500

    params = urlencode(
        {
            "response_type": "code",
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "state": state,
        }
    )
    return redirect(f"https://nid.naver.com/oauth2.0/authorize?{params}")


@auth_bp.get("/naver/callback")
def naver_callback():
    code = request.args.get("code")
    state = request.args.get("state")
    provider_error = request.args.get("error")
    provider_description = request.args.get("error_description")

    if provider_error:
        log_auth_error("naver", "provider_callback", f"{provider_error} {provider_description}")
        return redirect_with_error("naver", provider_error, provider_description)

    if not code:
        return redirect_with_error("naver", "naver_code_missing")

    if state != current_app.config["NAVER_STATE"]:
        log_auth_error("naver", "state_check", f"expected={current_app.config['NAVER_STATE']} actual={state}")
        return redirect_with_error("naver", "naver_state_mismatch", f"state={state}")

    token_response = requests.post(
        "https://nid.naver.com/oauth2.0/token",
        params={
            "grant_type": "authorization_code",
            "client_id": current_app.config["NAVER_CLIENT_ID"],
            "client_secret": current_app.config["NAVER_CLIENT_SECRET"],
            "code": code,
            "state": state,
        },
        timeout=10,
    )

    if not token_response.ok:
        log_auth_error("naver", "token_exchange", token_response.text)
        return redirect_with_error("naver", "naver_token_exchange_failed", token_response.text)

    token_data = token_response.json()

    if token_data.get("error"):
        log_auth_error("naver", "token_exchange", token_data)
        return redirect_with_error(
            "naver",
            token_data.get("error"),
            token_data.get("error_description") or token_data,
        )

    access_token = token_data.get("access_token")
    profile_response = requests.get(
        "https://openapi.naver.com/v1/nid/me",
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=10,
    )

    if not profile_response.ok:
        log_auth_error("naver", "profile_fetch", profile_response.text)
        return redirect_with_error("naver", "naver_profile_fetch_failed", profile_response.text)

    response_data = profile_response.json().get("response", {})

    user = upsert_social_user(
        provider="naver",
        social_id=str(response_data.get("id")),
        email=response_data.get("email"),
        nickname=response_data.get("nickname") or response_data.get("name") or "마음 사용자",
        profile_image=response_data.get("profile_image"),
    )

    return redirect_with_user("naver", user)


@auth_bp.get("/google/login")
def google_login():
    client_id = current_app.config["GOOGLE_CLIENT_ID"]
    redirect_uri = current_app.config["GOOGLE_REDIRECT_URI"]

    if not client_id:
        return jsonify({"message": "GOOGLE_CLIENT_ID가 설정되지 않았습니다."}), 500

    params = urlencode(
        {
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "select_account",
        }
    )
    return redirect(f"https://accounts.google.com/o/oauth2/v2/auth?{params}")


@auth_bp.get("/google/callback")
def google_callback():
    code = request.args.get("code")
    provider_error = request.args.get("error")
    provider_description = request.args.get("error_description")

    if provider_error:
        log_auth_error("google", "provider_callback", f"{provider_error} {provider_description}")
        return redirect_with_error("google", provider_error, provider_description)

    if not code:
        return redirect_with_error("google", "google_code_missing")

    token_response = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "client_id": current_app.config["GOOGLE_CLIENT_ID"],
            "client_secret": current_app.config["GOOGLE_CLIENT_SECRET"],
            "redirect_uri": current_app.config["GOOGLE_REDIRECT_URI"],
            "grant_type": "authorization_code",
            "code": code,
        },
        timeout=10,
    )

    if not token_response.ok:
        log_auth_error("google", "token_exchange", token_response.text)
        return redirect_with_error("google", "google_token_exchange_failed", token_response.text)

    access_token = token_response.json().get("access_token")
    profile_response = requests.get(
        "https://openidconnect.googleapis.com/v1/userinfo",
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=10,
    )

    if not profile_response.ok:
        log_auth_error("google", "profile_fetch", profile_response.text)
        return redirect_with_error("google", "google_profile_fetch_failed", profile_response.text)

    profile = profile_response.json()

    user = upsert_social_user(
        provider="google",
        social_id=str(profile.get("sub")),
        email=profile.get("email"),
        nickname=profile.get("name") or "마음 사용자",
        profile_image=profile.get("picture"),
    )

    return redirect_with_user("google", user)
