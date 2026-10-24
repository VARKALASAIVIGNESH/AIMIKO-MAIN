"""S3-compatible object storage backend (production).

Uses boto3. Falls back to reporting an error in health checks when
credentials are not configured.
"""

import io
from typing import BinaryIO

from app.core.config import settings
from app.services.storage.base import StorageBackend
from app.services.storage.local import LocalStorage


class S3Storage(StorageBackend):
    def __init__(self):
        import boto3  # imported lazily so dev installs can skip it

        self.client = boto3.client(
            "s3",
            region_name=settings.storage_s3_region,
            aws_access_key_id=settings.storage_s3_access_key or None,
            aws_secret_access_key=settings.storage_s3_secret_key or None,
        )
        self.bucket = settings.storage_s3_bucket
        if not self.bucket:
            raise ValueError("storage_s3_bucket is required for the s3 backend")

    def save(self, key: str, data: BinaryIO, content_type: str = "") -> str:
        kwargs = {"Bucket": self.bucket, "Key": key, "Body": data}
        if content_type:
            kwargs["ContentType"] = content_type
        self.client.put_object(**kwargs)
        return f"s3://{self.bucket}/{key}"

    def open(self, key: str) -> BinaryIO:
        return self.client.get_object(Bucket=self.bucket, Key=key)["Body"]

    def exists(self, key: str) -> bool:
        try:
            self.client.head_object(Bucket=self.bucket, Key=key)
            return True
        except Exception:
            return False

    def delete(self, key: str) -> None:
        self.client.delete_object(Bucket=self.bucket, Key=key)

    def health(self) -> dict:
        try:
            self.client.head_bucket(Bucket=self.bucket)
            ok = True
            detail = "bucket reachable"
        except Exception as exc:
            ok = False
            detail = str(exc)
        return {"backend": "s3", "ok": ok, "detail": detail}


def build_storage() -> StorageBackend:
    if settings.storage_backend == "s3":
        return S3Storage()
    return LocalStorage(settings.storage_local_root)


_storage: StorageBackend | None = None


def get_storage() -> StorageBackend:
    global _storage
    if _storage is None:
        _storage = build_storage()
    return _storage
