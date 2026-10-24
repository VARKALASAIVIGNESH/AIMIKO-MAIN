"""Storage backend abstraction.

AIMIKO stores uploaded files/documents through this interface so the
underlying object storage can be swapped (local disk in dev, S3-compatible
object storage in production) without touching service code.
"""

import abc
from typing import BinaryIO


class StorageBackend(abc.ABC):
    @abc.abstractmethod
    def save(self, key: str, data: BinaryIO, content_type: str = "") -> str:
        """Persist data under key and return its public/access URL or key."""

    @abc.abstractmethod
    def open(self, key: str) -> BinaryIO:
        """Return a readable stream for the stored object."""

    @abc.abstractmethod
    def exists(self, key: str) -> bool:
        ...

    @abc.abstractmethod
    def delete(self, key: str) -> None:
        ...

    @abc.abstractmethod
    def health(self) -> dict:
        """Return a small dict describing backend health for system status."""
