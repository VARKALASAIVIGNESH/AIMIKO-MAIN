"""Admin endpoints (role = admin only).

These endpoints read across tenants and expose internal information
(leads, customers, usage, system health, audit logs, open-source components).
They are protected by role-based auth and must never be made public.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_client_ip, get_current_admin
from app.core.audit import log_audit
from app.core.database import get_db
from app.models import (
    AuditLog,
    ContactSubmission,
    Customer,
    DemoSession,
    Lead,
    Organization,
    Project,
    UsageMetric,
    User,
)
from app.schemas import (
    AuditLogOut,
    ComponentOut,
    ContactOut,
    CustomerCreate,
    CustomerOut,
    LeadOut,
    LeadStatusUpdate,
    MessageOut,
    Page,
    ProjectOut,
    SystemHealthOut,
    UsageOut,
    UsageStats,
)
from app.services.engines.registry import build_engines
from app.services.storage.s3 import get_storage
from app.services.storage.base import StorageBackend

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(get_current_admin)])

COMPONENTS = [
    {
        "name": "Activepieces",
        "purpose": "Workflow & business-process automation engine",
        "repository": "https://github.com/activepieces/activepieces",
        "license": "MIT (with enterprise tiers)",
        "status": "cloned",
        "note": "Phase 2 — source cloned to engines/activepieces; engine configurable via ENGINE_ACTIVEPIECES_URL",
    },
    {
        "name": "Document Chat System",
        "purpose": "Document RAG, Q&A and knowledge base engine",
        "repository": "https://github.com/watat83/document-chat-system",
        "license": "MIT",
        "status": "cloned",
        "note": "Phase 3 — source cloned to engines/document-chat-system; engine configurable via ENGINE_DOCUMENT_CHAT_URL",
    },
    {
        "name": "Dograh",
        "purpose": "Voice agent / call handling foundation",
        "repository": "https://github.com/dograh-hq/dograh",
        "license": "BSD-2-Clause",
        "status": "cloned",
        "note": "Phase 4 — source cloned to engines/dograh; telephony/STT/TTS configurable; pipecat submodule",
    },
    {
        "name": "AI-Infra-Guard",
        "purpose": "LLM / agent / MCP security assessment engine",
        "repository": "https://github.com/Tencent/AI-Infra-Guard",
        "license": "Apache-2.0",
        "status": "cloned",
        "note": "Phase 7 — source cloned to engines/AI-Infra-Guard; authenticated access only",
    },
    {
        "name": "OpenCV",
        "purpose": "Computer vision primitives (detection, OCR, analysis)",
        "repository": "https://github.com/opencv/opencv",
        "license": "Apache-2.0",
        "status": "cloned",
        "note": "Phase 6 — source cloned to engines/opencv",
    },
    {
        "name": "CVAT",
        "purpose": "Dataset annotation / labeling platform",
        "repository": "https://github.com/cvat-ai/cvat",
        "license": "MIT",
        "status": "cloned",
        "note": "Phase 6 — source cloned to engines/cvat",
    },
    {
        "name": "AIMIKO Data & Research Service",
        "purpose": "AIMIKO-native data analysis / research stack (FastAPI + Pandas + NumPy + LLM)",
        "repository": "https://github.com/aimiko/platform (internal)",
        "license": "Proprietary (AIMIKO)",
        "status": "planned",
        "note": "Phase 5 integration",
    },
]


def _paginate(query, page: int, page_size: int):
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return items, total


# ---------- Leads ----------
@router.get("/leads", response_model=Page)
def list_leads(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = db.query(Lead)
    if status_filter:
        q = q.filter(Lead.status == status_filter)
    if search:
        like = f"%{search}%"
        q = q.filter(
            (Lead.name.ilike(like)) | (Lead.company.ilike(like)) | (Lead.email.ilike(like))
        )
    q = q.order_by(Lead.created_at.desc())
    items, total = _paginate(q, page, page_size)
    return Page(items=[LeadOut.model_validate(i, from_attributes=True).model_dump() for i in items], total=total, page=page, page_size=page_size)


@router.patch("/leads/{lead_id}/status", response_model=LeadOut)
def update_lead_status(
    lead_id: int,
    payload: LeadStatusUpdate,
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    lead.status = payload.status
    db.commit()
    db.refresh(lead)
    log_audit(db, admin.id, admin.email, "lead.status_update", "lead", str(lead.id), {"status": payload.status}, get_client_ip(request))
    return lead


# ---------- Contacts ----------
@router.get("/contacts", response_model=Page)
def list_contacts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(ContactSubmission).order_by(ContactSubmission.created_at.desc())
    items, total = _paginate(q, page, page_size)
    return Page(items=[ContactOut.model_validate(i, from_attributes=True).model_dump() for i in items], total=total, page=page, page_size=page_size)


# ---------- Customers ----------
@router.get("/customers", response_model=Page)
def list_customers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = db.query(Customer)
    if search:
        like = f"%{search}%"
        q = q.filter((Customer.name.ilike(like)) | (Customer.company.ilike(like)) | (Customer.email.ilike(like)))
    q = q.order_by(Customer.created_at.desc())
    items, total = _paginate(q, page, page_size)
    return Page(items=[CustomerOut.model_validate(i, from_attributes=True).model_dump() for i in items], total=total, page=page, page_size=page_size)


@router.post("/customers", response_model=CustomerOut, status_code=status.HTTP_201_CREATED)
def create_customer(
    payload: CustomerCreate,
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    customer = Customer(**payload.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    log_audit(db, admin.id, admin.email, "customer.create", "customer", str(customer.id), {"name": customer.name}, get_client_ip(request))
    return customer


@router.post("/leads/{lead_id}/convert", response_model=CustomerOut)
def convert_lead_to_customer(
    lead_id: int,
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    existing = db.query(Customer).filter(Customer.email == lead.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="A customer with this email already exists")
    customer = Customer(
        name=lead.name,
        company=lead.company,
        email=lead.email,
        country=lead.country,
        industry=lead.industry,
        services=[lead.service] if lead.service else [],
        status="active",
        source_lead_id=lead.id,
    )
    db.add(customer)
    lead.status = "won"
    db.commit()
    db.refresh(customer)
    log_audit(db, admin.id, admin.email, "lead.convert", "customer", str(customer.id), {"lead_id": lead_id}, get_client_ip(request))
    return customer


# ---------- Projects (all tenants) ----------
@router.get("/projects", response_model=Page)
def list_all_projects(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(Project).order_by(Project.created_at.desc())
    items, total = _paginate(q, page, page_size)
    return Page(items=[ProjectOut.model_validate(i, from_attributes=True).model_dump() for i in items], total=total, page=page, page_size=page_size)


# ---------- Usage ----------
@router.get("/usage", response_model=UsageStats)
def usage_stats(
    metric_type: Optional[str] = Query(None, alias="type"),
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
):
    since = None
    from datetime import datetime, timedelta, timezone
    since = datetime.now(timezone.utc) - timedelta(days=days)

    q = db.query(UsageMetric)
    if metric_type:
        q = q.filter(UsageMetric.metric_type == metric_type)
    q = q.filter(UsageMetric.created_at >= since)
    rows = q.all()

    total_requests = len(rows)
    total_cost = sum(r.cost_usd or 0 for r in rows)
    total_tokens = sum((r.input_tokens or 0) + (r.output_tokens or 0) for r in rows)

    by_service: dict[str, int] = {}
    by_day: dict[str, int] = {}
    for r in rows:
        by_service[r.service or "unknown"] = by_service.get(r.service or "unknown", 0) + 1
        by_day[r.created_at.strftime("%Y-%m-%d")] = by_day.get(r.created_at.strftime("%Y-%m-%d"), 0) + 1

    return UsageStats(
        total_requests=total_requests,
        total_cost_usd=round(total_cost, 4),
        total_tokens=total_tokens,
        by_service=[{"name": k, "count": v} for k, v in sorted(by_service.items(), key=lambda x: -x[1])],
        by_day=[{"date": k, "count": v} for k, v in sorted(by_day.items())],
    )


@router.get("/usage/records", response_model=Page)
def usage_records(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(UsageMetric).order_by(UsageMetric.created_at.desc())
    items, total = _paginate(q, page, page_size)
    return Page(items=[UsageOut.model_validate(i, from_attributes=True).model_dump() for i in items], total=total, page=page, page_size=page_size)


@router.get("/demo-usage", response_model=Page)
def demo_usage(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(DemoSession).order_by(DemoSession.created_at.desc())
    items, total = _paginate(q, page, page_size)
    return Page(
        items=[
            {
                "id": d.id,
                "service": d.service,
                "session_id": d.session_id,
                "actions": d.actions,
                "completed": d.completed,
                "created_at": d.created_at.isoformat(),
            }
            for d in items
        ],
        total=total,
        page=page,
        page_size=page_size,
    )


# ---------- System health ----------
@router.get("/system/health", response_model=SystemHealthOut)
def system_health(db: Session = Depends(get_db)):
    checks = []

    try:
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        checks.append({"name": "database", "status": "ok"})
    except Exception as exc:
        checks.append({"name": "database", "status": "error", "detail": str(exc)})

    try:
        storage: StorageBackend = get_storage()
        h = storage.health()
        checks.append({"name": "storage", "status": "ok" if h["ok"] else "error", "detail": h.get("detail")})
    except Exception as exc:
        checks.append({"name": "storage", "status": "error", "detail": str(exc)})

    for engine in build_engines():
        checks.append({"name": f"engine:{engine.key}", "status": engine.status})

    status_value = "healthy" if all(c.get("status") == "ok" for c in checks if c["name"] in ("database", "storage")) else "degraded"
    return SystemHealthOut(status=status_value, checks=checks)


# ---------- Open-source components ----------
@router.get("/components", response_model=list[ComponentOut])
def components():
    return COMPONENTS


# ---------- Audit logs ----------
@router.get("/audit-logs", response_model=Page)
def audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(30, ge=1, le=200),
    action: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = db.query(AuditLog)
    if action:
        q = q.filter(AuditLog.action == action)
    q = q.order_by(AuditLog.created_at.desc())
    items, total = _paginate(q, page, page_size)
    return Page(items=[AuditLogOut.model_validate(i, from_attributes=True).model_dump() for i in items], total=total, page=page, page_size=page_size)


# ---------- Dashboard summary ----------
@router.get("/summary")
def summary(db: Session = Depends(get_db)):
    return {
        "leads_total": db.query(Lead).count(),
        "leads_new": db.query(Lead).filter(Lead.status == "new").count(),
        "contacts_total": db.query(ContactSubmission).count(),
        "customers_total": db.query(Customer).count(),
        "projects_total": db.query(Project).count(),
        "projects_live": db.query(Project).filter(Project.status == "live").count(),
        "users_total": db.query(User).count(),
        "organizations_total": db.query(Organization).count(),
        "usage_requests_total": db.query(UsageMetric).count(),
        "demo_sessions_total": db.query(DemoSession).count(),
        "audit_logs_total": db.query(AuditLog).count(),
    }
