import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[1]
ENV_PATH = BASE_DIR / ".env"

load_dotenv(ENV_PATH)


class Config:
    DEBUG = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    PORT = int(os.getenv("PORT", "5000"))
    SECRET_KEY = os.getenv("APP_SECRET_KEY", "replace-this-with-a-real-secret")
    MONGO_URI = os.getenv("MONGO_URI", "PASTE_YOUR_MONGODB_CONNECTION_STRING_HERE")
    DATABASE_NAME = os.getenv("MONGO_DATABASE_NAME", "mind_app")
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    FRONTEND_URL = os.getenv("FRONTEND_URL", ALLOWED_ORIGINS[0])
    KAKAO_CLIENT_ID = os.getenv("KAKAO_CLIENT_ID", "")
    KAKAO_CLIENT_SECRET = os.getenv("KAKAO_CLIENT_SECRET", "")
    KAKAO_REDIRECT_URI = os.getenv(
        "KAKAO_REDIRECT_URI",
        "http://localhost:5000/api/auth/kakao/callback",
    )
    NAVER_CLIENT_ID = os.getenv("NAVER_CLIENT_ID", "")
    NAVER_CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET", "")
    NAVER_REDIRECT_URI = os.getenv(
        "NAVER_REDIRECT_URI",
        "http://localhost:5000/api/auth/naver/callback",
    )
    NAVER_STATE = os.getenv("NAVER_STATE", "mindbridge-login")
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI = os.getenv(
        "GOOGLE_REDIRECT_URI",
        "http://localhost:5000/api/auth/google/callback",
    )
