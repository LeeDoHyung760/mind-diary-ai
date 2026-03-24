from datetime import datetime, timezone


def utc_now():
    return datetime.now(timezone.utc)


def serialize_datetime(value):
    if value is None:
        return None

    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)

    return value.isoformat()
