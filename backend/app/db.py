from pymongo import MongoClient

mongo_client = None
mongo_db = None


def connect_mongo(app):
    global mongo_client, mongo_db

    mongo_client = MongoClient(app.config["MONGO_URI"])
    mongo_db = mongo_client[app.config["DATABASE_NAME"]]

    app.extensions["mongo_client"] = mongo_client
    app.extensions["mongo_db"] = mongo_db


def get_db():
    return mongo_db
