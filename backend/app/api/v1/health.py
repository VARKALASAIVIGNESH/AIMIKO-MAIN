"""Public health endpoint (no auth)."""

from fastapi import APIRouter
from sqlalchemy import text

from app.core.config import settings
from app.core.database import engine

router = APIRouter(tags=["health"])


@router.get("/health")
def health():
    db_ok = True
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception:
        db_ok = False
    return {
        "status": "ok" if db_ok else "error",
        "service": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "database": "ok" if db_ok else "error",
    }
