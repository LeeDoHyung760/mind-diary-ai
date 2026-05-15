from pymongo import ASCENDING, DESCENDING, MongoClient

mongo_client = None
mongo_db = None


def connect_mongo(app):
    global mongo_client, mongo_db

    mongo_client = MongoClient(
        app.config["MONGO_URI"],
        serverSelectionTimeoutMS=5000,
    )
    mongo_db = mongo_client[app.config["DATABASE_NAME"]]

    app.extensions["mongo_client"] = mongo_client
    app.extensions["mongo_db"] = mongo_db
    ensure_indexes(app)


def ensure_indexes(app):
    if mongo_db is None:
        return

    try:
        mongo_db.users.create_index(
            [("socialProvider", ASCENDING), ("socialId", ASCENDING)],
            unique=True,
            background=True,
        )
        mongo_db.chat_sessions.create_index(
            [("userId", ASCENDING), ("updatedAt", DESCENDING)],
            background=True,
        )
    except Exception as exc:
        app.logger.warning("MongoDB index setup skipped: %s", exc)


def get_db():
    return mongo_db
