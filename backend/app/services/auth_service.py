from urllib.parse import urlencode

import requests
from flask import current_app

from ..repositories.user_repository import upsert_social_user
from ..utils import utc_now


def _build_frontend_redirect(path, **params):
    query = urlencode({key: value for key, value in params.items() if value is not None})
    base = f"{current_app.config['FRONTEND_URL']}{path}"
    return f"{base}?{query}" if query else base


def _sanitize_detail(detail):
    if not detail:
        return None

    text = str(detail).strip().replace("\n", " ")
    return text[:220]


def _log_auth_error(provider, step, detail=None):
    current_app.logger.error("[%s] %s failed: %s", provider, step, _sanitize_detail(detail) or "unknown")


def _redirect_with_user(provider, user):
    return _build_frontend_redirect(
        f"/auth/{provider}/callback",
        userId=str(user["_id"]),
        onboarding="true" if not user.get("isOnboardingCompleted") else "false",
    )


def _redirect_with_error(provider, error_code, reason=None):
    return _build_frontend_redirect(
        f"/auth/{provider}/callback",
        error=error_code,
        reason=_sanitize_detail(reason),
    )


def _save_social_user(provider, social_id, email, nickname, profile_image=None):
    now = utc_now()
    return upsert_social_user(
        provider,
        social_id,
        {
            "socialProvider": provider,
            "socialId": social_id,
            "email": email,
            "nickname": nickname,
            "profileImage": profile_image,
            "updatedAt": now,
        },
        {
            "assistantName": "Mind",
            "avatarStyle": "gold",
            "themeColor": "#fcc14c",
            "isOnboardingCompleted": False,
            "createdAt": now,
        },
    )


def get_kakao_login_url():
    client_id = current_app.config["KAKAO_CLIENT_ID"]
    redirect_uri = current_app.config["KAKAO_REDIRECT_URI"]
    params = urlencode(
        {
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
        }
    )
    return client_id, f"https://kauth.kakao.com/oauth/authorize?{params}"


def handle_kakao_callback(args):
    code = args.get("code")
    provider_error = args.get("error")
    provider_description = args.get("error_description")

    if provider_error:
        _log_auth_error("kakao", "provider_callback", f"{provider_error} {provider_description}")
        return _redirect_with_error("kakao", provider_error, provider_description)

    if not code:
        return _redirect_with_error("kakao", "kakao_code_missing")

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
        _log_auth_error("kakao", "token_exchange", token_response.text)
        return _redirect_with_error("kakao", "kakao_token_exchange_failed", token_response.text)

    access_token = token_response.json().get("access_token")
    profile_response = requests.get(
        "https://kapi.kakao.com/v2/user/me",
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=10,
    )

    if not profile_response.ok:
        _log_auth_error("kakao", "profile_fetch", profile_response.text)
        return _redirect_with_error("kakao", "kakao_profile_fetch_failed", profile_response.text)

    profile = profile_response.json()
    account = profile.get("kakao_account", {})
    profile_data = account.get("profile", {})
    user = _save_social_user(
        provider="kakao",
        social_id=str(profile.get("id")),
        email=account.get("email"),
        nickname=profile_data.get("nickname") or "Mind user",
        profile_image=profile_data.get("profile_image_url"),
    )
    return _redirect_with_user("kakao", user)


def get_naver_login_url():
    client_id = current_app.config["NAVER_CLIENT_ID"]
    redirect_uri = current_app.config["NAVER_REDIRECT_URI"]
    state = current_app.config["NAVER_STATE"]
    params = urlencode(
        {
            "response_type": "code",
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "state": state,
        }
    )
    return client_id, f"https://nid.naver.com/oauth2.0/authorize?{params}"


def handle_naver_callback(args):
    code = args.get("code")
    state = args.get("state")
    provider_error = args.get("error")
    provider_description = args.get("error_description")

    if provider_error:
        _log_auth_error("naver", "provider_callback", f"{provider_error} {provider_description}")
        return _redirect_with_error("naver", provider_error, provider_description)

    if not code:
        return _redirect_with_error("naver", "naver_code_missing")

    if state != current_app.config["NAVER_STATE"]:
        _log_auth_error("naver", "state_check", f"expected={current_app.config['NAVER_STATE']} actual={state}")
        return _redirect_with_error("naver", "naver_state_mismatch", f"state={state}")

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
        _log_auth_error("naver", "token_exchange", token_response.text)
        return _redirect_with_error("naver", "naver_token_exchange_failed", token_response.text)

    token_data = token_response.json()

    if token_data.get("error"):
        _log_auth_error("naver", "token_exchange", token_data)
        return _redirect_with_error(
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
        _log_auth_error("naver", "profile_fetch", profile_response.text)
        return _redirect_with_error("naver", "naver_profile_fetch_failed", profile_response.text)

    profile = profile_response.json().get("response", {})
    user = _save_social_user(
        provider="naver",
        social_id=str(profile.get("id")),
        email=profile.get("email"),
        nickname=profile.get("nickname") or profile.get("name") or "Mind user",
        profile_image=profile.get("profile_image"),
    )
    return _redirect_with_user("naver", user)


def get_google_login_url():
    client_id = current_app.config["GOOGLE_CLIENT_ID"]
    redirect_uri = current_app.config["GOOGLE_REDIRECT_URI"]
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
    return client_id, f"https://accounts.google.com/o/oauth2/v2/auth?{params}"


def handle_google_callback(args):
    code = args.get("code")
    provider_error = args.get("error")
    provider_description = args.get("error_description")

    if provider_error:
        _log_auth_error("google", "provider_callback", f"{provider_error} {provider_description}")
        return _redirect_with_error("google", provider_error, provider_description)

    if not code:
        return _redirect_with_error("google", "google_code_missing")

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
        _log_auth_error("google", "token_exchange", token_response.text)
        return _redirect_with_error("google", "google_token_exchange_failed", token_response.text)

    access_token = token_response.json().get("access_token")
    profile_response = requests.get(
        "https://openidconnect.googleapis.com/v1/userinfo",
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=10,
    )

    if not profile_response.ok:
        _log_auth_error("google", "profile_fetch", profile_response.text)
        return _redirect_with_error("google", "google_profile_fetch_failed", profile_response.text)

    profile = profile_response.json()
    user = _save_social_user(
        provider="google",
        social_id=str(profile.get("sub")),
        email=profile.get("email"),
        nickname=profile.get("name") or "Mind user",
        profile_image=profile.get("picture"),
    )
    return _redirect_with_user("google", user)
