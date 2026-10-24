"""Authenticated application endpoints (tenant-scoped)."""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_client_ip, get_current_user
from app.core.audit import log_audit
from app.core.database import get_db
from app.models import DemoSession, Project, UsageMetric, User
from app.schemas import DemoEvent, MessageOut, ProjectCreate, ProjectOut, ProjectUpdate
from app.services.engines.registry import engine_status_map, engine_url

router = APIRouter(tags=["app"])


@router.get("/app/overview")
def app_overview(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Lightweight per-tenant overview for the app dashboard."""
    org_id = user.organization_id
    q = db.query(Project)
    if org_id:
        q = q.filter(Project.organization_id == org_id)
    projects = q.all()
    return {
        "projects": [ProjectOut.model_validate(p, from_attributes=True).model_dump() for p in projects],
        "project_count": len(projects),
        "active_count": sum(1 for p in projects if p.status == "live"),
        "engines": engine_status_map(),
    }


# ---------- Projects ----------
@router.get("/app/projects", response_model=list[ProjectOut])
def list_projects(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    q = db.query(Project)
    if user.organization_id:
        q = q.filter(Project.organization_id == user.organization_id)
    return q.order_by(Project.created_at.desc()).all()


@router.post("/app/projects", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectCreate, request: Request, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    project = Project(
        name=payload.name.strip(),
        service=payload.service.strip(),
        description=payload.description.strip(),
        status=payload.status,
        owner_id=user.id,
        organization_id=user.organization_id,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    log_audit(db, user.id, user.email, "project.create", "project", str(project.id), {"name": project.name}, get_client_ip(request))
    return project


@router.patch("/app/projects/{project_id}", response_model=ProjectOut)
def update_project(
    project_id: int,
    payload: ProjectUpdate,
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id)
    if user.organization_id:
        project = project.filter(Project.organization_id == user.organization_id)
    project = project.first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        if v is not None:
            setattr(project, k, v)
    db.commit()
    db.refresh(project)
    log_audit(db, user.id, user.email, "project.update", "project", str(project.id), data, get_client_ip(request))
    return project


# ---------- Demos ----------
@router.post("/app/demos")
def record_demo(payload: DemoEvent, request: Request, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    demo = DemoSession(
        service=payload.service.strip(),
        session_id=payload.session_id,
        user_id=user.id,
        organization_id=user.organization_id,
        actions=1,
        completed=payload.action == "complete",
    )
    db.add(demo)
    db.commit()
    return MessageOut(message=f"Demo event recorded for {demo.service}")


# ---------- Service workspaces ----------
# Each workspace returns the engine status + configuration needs for that
# service area. Real engine calls are added in the corresponding phase.


@router.get("/app/workspace/{area}")
def workspace(area: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    allowed = {"automations", "documents", "voice", "security", "vision", "data", "research"}
    if area not in allowed:
        raise HTTPException(status_code=404, detail="Unknown workspace")
    area_to_engine = {
        "automations": "activepieces",
        "documents": "document_chat",
        "voice": "dograh",
        "security": "ai_infra_guard",
        "vision": "cvat",
        "data": "aimiko_native",
        "research": "aimiko_native",
    }
    engine = area_to_engine[area]
    return {
        "area": area,
        "engine": engine,
        "status": engine_status_map().get(engine, "not_configured"),
        "url": engine_url(engine),
        "organization_id": user.organization_id,
        "configured": engine_status_map().get(engine) in ("online", "available"),
    }
