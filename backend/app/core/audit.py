"""Audit logging helpers."""

from typing import Any, Optional

from sqlalchemy.orm import Session

from app.models import AuditLog


def log_audit(
    db: Session,
    actor_id: Optional[int],
    actor_email: str,
    action: str,
    resource_type: str = "",
    resource_id: str = "",
    details: Optional[dict[str, Any]] = None,
    ip_address: str = "",
) -> AuditLog:
    entry = AuditLog(
        actor_id=actor_id,
        actor_email=actor_email or "",
        action=action,
        resource_type=resource_type,
        resource_id=str(resource_id or ""),
        details=details or {},
        ip_address=ip_address or "",
    )
    db.add(entry)
    db.commit()
    return entry
