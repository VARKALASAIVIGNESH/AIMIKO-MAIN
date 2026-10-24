"""Local filesystem storage backend (development fallback)."""

import io
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import BinaryIO

from app.services.storage.base import StorageBackend


def _safe_key(key: str) -> Path:
    root = Path(os.environ.get("STORAGE_LOCAL_ROOT", "./storage")).resolve()
    return root.joinpath(key)


class LocalStorage(StorageBackend):
    def __init__(self, root: str = "./storage"):
        self.root = Path(root).resolve()
        self.root.mkdir(parents=True, exist_ok=True)

    def save(self, key: str, data: BinaryIO, content_type: str = "") -> str:
        path = _safe_key(key)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data.read())
        return str(path)

    def open(self, key: str) -> BinaryIO:
        path = _safe_key(key)
        return io.BytesIO(path.read_bytes())

    def exists(self, key: str) -> bool:
        return _safe_key(key).exists()

    def delete(self, key: str) -> None:
        path = _safe_key(key)
        if path.exists():
            path.unlink()

    def health(self) -> dict:
        probe = f"_probe_{uuid.uuid4().hex}"
        ok = True
        try:
            self.save(probe, io.BytesIO(b"ok"))
            self.delete(probe)
        except Exception as exc:  # pragma: no cover
            ok = False
            probe = str(exc)
        return {"backend": "local", "ok": ok, "detail": f"root={self.root}"}
