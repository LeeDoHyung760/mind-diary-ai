from pymongo import ReturnDocument

from ..db import get_db


def insert_user(document):
    db = get_db()
    inserted = db.users.insert_one(document)
    return db.users.find_one({"_id": inserted.inserted_id})


def find_user_by_id(document_id):
    db = get_db()
    return db.users.find_one({"_id": document_id})


def update_user_by_id(document_id, updates):
    db = get_db()
    return db.users.find_one_and_update(
        {"_id": document_id},
        {"$set": updates},
        return_document=ReturnDocument.AFTER,
    )


def upsert_social_user(provider, social_id, profile_updates, profile_defaults):
    db = get_db()
    return db.users.find_one_and_update(
        {"socialProvider": provider, "socialId": social_id},
        {
            "$set": profile_updates,
            "$setOnInsert": profile_defaults,
        },
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
