from pymongo import ReturnDocument

from ..db import get_db


def find_chats_by_user_id(owner_id):
    db = get_db()
    return db.chat_sessions.find({"userId": owner_id}).sort("updatedAt", -1)


def update_chat_messages(chat_id, owner_id, messages, updated_at):
    db = get_db()
    return db.chat_sessions.find_one_and_update(
        {"_id": chat_id, "userId": owner_id},
        {
            "$push": {"messages": {"$each": messages}},
            "$set": {"updatedAt": updated_at},
        },
        return_document=ReturnDocument.AFTER,
    )


def insert_chat(document):
    db = get_db()
    inserted = db.chat_sessions.insert_one(document)
    return db.chat_sessions.find_one({"_id": inserted.inserted_id})


def delete_chat(chat_id, owner_id):
    db = get_db()
    return db.chat_sessions.delete_one({"_id": chat_id, "userId": owner_id})
