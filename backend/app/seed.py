"""Seed data for local development.

Creates the bootstrap admin and, only in non-production environments, a set
of realistic sample records so the admin dashboard is not empty on first run.
"""

from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
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


def _ensure_admin(db: Session) -> User:
    admin = db.query(User).filter(User.email == settings.admin_email).first()
    if admin:
        admin.password_hash = hash_password(settings.admin_password)
        db.commit()
        return admin
    org = db.query(Organization).filter(Organization.is_internal.is_(True)).first()
    if not org:
        org = Organization(name="AIMIKO Internal", industry="AI Services", is_internal=True)
        db.add(org)
        db.flush()
    admin = User(
        email=settings.admin_email,
        password_hash=hash_password(settings.admin_password),
        full_name=settings.admin_full_name,
        role="admin",
        organization_id=org.id,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin


def seed(db: Session) -> None:
    _ensure_admin(db)

    from app.services.json_store import JSONStore
    JSONStore.dump_all(db)

    if settings.environment == "production":
        return

    if db.query(Lead).count() > 0:
        return

    now = datetime.now(timezone.utc)

    sample_leads = [
        Lead(
            name="Sarah Mitchell",
            company="Brightline Dental",
            email="sarah@brightline.example",
            country="United States",
            industry="Healthcare & Dental",
            service="Voice AI",
            requirements="24/7 AI receptionist for appointment booking and recall calls.",
            budget="$5k - $10k",
            message="We lose calls after hours. Need an AI receptionist integrated with our PMS.",
            source="web",
            status="qualified",
        ),
        Lead(
            name="Daniel Okafor",
            company="Meridian Legal LLP",
            email="d.okafor@meridian.example",
            country="United Kingdom",
            industry="Legal",
            service="Document AI",
            requirements="Contract analysis and clause extraction across 40k legacy documents.",
            budget="$20k - $50k",
            message="Looking for RAG-based contract review with citations.",
            source="web",
            status="new",
        ),
        Lead(
            name="Priya Sharma",
            company="Nova Retail Group",
            email="priya@novaretail.example",
            country="India",
            industry="Retail & E-commerce",
            service="Computer Vision",
            requirements="Shelf monitoring and out-of-stock detection at 120 stores.",
            budget="Custom",
            message="Need automated visual inspection for stock levels.",
            source="demo",
            status="contacted",
        ),
        Lead(
            name="Tom Becker",
            company="Forge Manufacturing",
            email="tom@forge.example",
            country="Germany",
            industry="Manufacturing",
            service="AI Automation",
            requirements="Automate supplier onboarding and PO matching workflows.",
            budget="$10k - $20k",
            message="We use SAP; want workflow automation around it.",
            source="web",
            status="new",
        ),
    ]
    db.add_all(sample_leads)

    sample_contacts = [
        ContactSubmission(
            name="Lena Fischer",
            email="lena@example.com",
            subject="Partnership inquiry",
            message="Interested in white-labeling AIMIKO document AI for our legal portal.",
        ),
        ContactSubmission(
            name="Marco Rossi",
            email="marco@example.com",
            subject="Demo request",
            message="Would like to see the AI receptionist demo before engaging.",
        ),
    ]
    db.add_all(sample_contacts)

    org = Organization(name="Brightline Dental", country="United States", industry="Healthcare & Dental")
    db.add(org)
    db.flush()

    demo_user = User(
        email="demo@aimiko.ai",
        password_hash=hash_password("Demo1234!"),
        full_name="Demo Customer",
        role="user",
        organization_id=org.id,
    )
    db.add(demo_user)
    db.flush()

    customer = Customer(
        name="Sarah Mitchell",
        company="Brightline Dental",
        email="sarah@brightline.example",
        country="United States",
        industry="Healthcare & Dental",
        services=["Voice AI", "AI Automation"],
        status="active",
    )
    db.add(customer)
    db.flush()

    projects = [
        Project(
            name="AI Receptionist Deployment",
            service="Voice AI",
            description="After-hours appointment booking agent for three clinics.",
            status="building",
            owner_id=demo_user.id,
            customer_id=customer.id,
            organization_id=org.id,
        ),
        Project(
            name="Recall Call Automation",
            service="AI Automation",
            description="Automated patient recall and no-show follow-up flows.",
            status="live",
            owner_id=demo_user.id,
            customer_id=customer.id,
            organization_id=org.id,
        ),
    ]
    db.add_all(projects)

    usage_samples = [
        UsageMetric(
            metric_type="ai",
            service="Document AI",
            action="chat",
            provider="openai",
            model="gpt-4o-mini",
            input_tokens=1500,
            output_tokens=420,
            cost_usd=0.004,
            organization_id=org.id,
            user_id=demo_user.id,
            created_at=now - timedelta(days=2),
        ),
        UsageMetric(
            metric_type="ai",
            service="Voice AI",
            action="call_summary",
            provider="openai",
            model="gpt-4o-mini",
            input_tokens=3200,
            output_tokens=610,
            cost_usd=0.008,
            organization_id=org.id,
            user_id=demo_user.id,
            created_at=now - timedelta(days=1),
        ),
        UsageMetric(
            metric_type="api",
            service="AI Automation",
            action="webhook",
            provider="activepieces",
            status_code=200,
            duration_ms=340,
            organization_id=org.id,
            user_id=demo_user.id,
            created_at=now - timedelta(hours=6),
        ),
    ]
    db.add_all(usage_samples)

    demos = [
        DemoSession(service="Document AI", session_id="demo-1001", actions=4, completed=True, organization_id=org.id, user_id=demo_user.id),
        DemoSession(service="Voice AI", session_id="demo-1002", actions=2, completed=False, organization_id=org.id, user_id=demo_user.id),
        DemoSession(service="AI Automation", session_id="demo-1003", actions=1, completed=False),
    ]
    db.add_all(demos)

    audits = [
        AuditLog(actor_email=settings.admin_email, action="auth.login", resource_type="user", details={}),
        AuditLog(actor_email="demo@aimiko.ai", action="project.create", resource_type="project", resource_id="2", details={"name": "Recall Call Automation"}),
    ]
    db.commit()

    from app.services.json_store import JSONStore
    JSONStore.dump_all(db)

