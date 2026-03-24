from flask import Flask
from flask_cors import CORS

from .config import Config
from .db import connect_mongo
from .routes.chats import chats_bp
from .routes.auth import auth_bp
from .routes.health import health_bp
from .routes.users import users_bp


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
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(chats_bp, url_prefix="/api/users")

    return app
