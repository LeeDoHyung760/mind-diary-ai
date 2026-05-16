import logging

from flask import Flask
from flask_cors import CORS

from .config import Config
from .db import connect_mongo
from .routes.chats import chats_bp
from .routes.auth import auth_bp
from .routes.guest import guest_bp
from .routes.health import health_bp
from .routes.users import users_bp

logger = logging.getLogger(__name__)


def _load_ai_models():
    from models.emotion_kcelectra import emotion_model
    from models.chat import chat_model

    logger.info("AI 모델 로딩 시작...")
    emotion_model.load()
    chat_model.load()
    logger.info("AI 모델 로딩 완료")


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(
        app,
        resources={r"/api/*": {"origins": app.config["ALLOWED_ORIGINS"]}},
        supports_credentials=True,
    )

    connect_mongo(app)

    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(guest_bp, url_prefix="/api/guest")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(chats_bp, url_prefix="/api/users")

    _load_ai_models()

    return app
