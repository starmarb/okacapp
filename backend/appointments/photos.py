import uuid

from django.core.files.base import ContentFile
from django.core.files.storage import storages

EXTENSION = "webp"


def storage():
    """Resolve the configured backend. The only place the alias is read."""
    return storages["photos"]


def new_key(appointment_id: int, *, suffix: str = "", ext: str = EXTENSION) -> str:
    """Build a fresh, collision-free key for an appointment's photo."""
    return f"appointments/{appointment_id}/{uuid.uuid4().hex}{suffix}.{ext}"


def save_bytes(key: str, data: bytes) -> str:
    """Write bytes and return the final key (backends may adjust the name)."""
    return storage().save(key, ContentFile(data))


def open_bytes(key: str):
    """Open a file-like object for streaming the bytes back out."""
    return storage().open(key)


def delete_bytes(key: str) -> None:
    storage().delete(key)


def exists(key: str) -> bool:
    return storage().exists(key)


def direct_url(key: str) -> str:
    """URL for the ``redirect`` serving mode (presigned on S3, /media on disk)."""
    return storage().url(key)
