"""SQLAlchemy enterprise production models for AIMIKO Platform.

Supports PostgreSQL (Supabase / Neon) and SQLite for zero-downtime local dev.
Tenant isolation: resources belong to an Organization (tenant).
"""

from datetime import datetime, timezone
from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ─── 1. CORE TENANCY & IDENTITY ──────────────────────────────────────────────
class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(64), unique=True, index=True, nullable=True)
    org_type = Column(String(64), default="Institution")  # University, School, Company
    country = Column(String(120), default="")
    industry = Column(String(120), default="")
    is_internal = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)

    users = relationship("User", back_populates="organization")
    projects = relationship("Project", back_populates="organization")
    customers = relationship("Customer", back_populates="organization")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)  # nullable for pure Google OAuth users
    google_id = Column(String(255), unique=True, index=True, nullable=True)
    full_name = Column(String(255), default="")
    avatar_url = Column(String(512), default="")
    role = Column(String(40), default="student")  # student, teacher, institution, founder, developer, creator, admin, owner
    tier = Column(String(40), default="Free")     # Free, Pro, Campus Enterprise
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    headline = Column(String(255), default="")
    bio = Column(Text, default="")
    location = Column(String(120), default="")
    school_or_company = Column(String(255), default="")
    skills = Column(String(512), default="")
    groq_api_key = Column(String(255), default="")
    mikodin_terms_accepted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)
    last_login_at = Column(DateTime, nullable=True)

    organization = relationship("Organization", back_populates="users")
    projects = relationship("Project", back_populates="owner")
    subscriptions = relationship("Subscription", back_populates="user")
    transactions = relationship("PaymentTransaction", back_populates="user")


# ─── 2. PAYMENTS & SUBSCRIPTIONS (RAZORPAY & STRIPE) ──────────────────────────
class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    plan_name = Column(String(100), nullable=False)  # Free, Faculty Pro, Works Agent Pass, Campus Enterprise
    gateway = Column(String(40), default="razorpay")  # razorpay | stripe
    gateway_subscription_id = Column(String(255), nullable=True)
    amount = Column(Float, default=0.0)
    currency = Column(String(10), default="INR")
    status = Column(String(40), default="active")  # active | cancelled | past_due
    current_period_start = Column(DateTime, default=utcnow)
    current_period_end = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="subscriptions")


class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_code = Column(String(100), unique=True, index=True, nullable=False)  # TXN-XXXX
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    gateway = Column(String(40), default="razorpay")  # razorpay | stripe
    gateway_payment_id = Column(String(255), index=True, nullable=True)
    gateway_order_id = Column(String(255), nullable=True)
    gateway_signature = Column(String(512), nullable=True)
    plan_name = Column(String(100), default="")
    status = Column(String(40), default="success")  # success | pending | failed | refunded
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=utcnow, index=True)

    user = relationship("User", back_populates="transactions")


# ─── 3. AIMIKO LEARN (AI ACADEMIC ECOSYSTEM) ───────────────────────────────────
class LearnAssignment(Base):
    __tablename__ = "learn_assignments"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    subject = Column(String(120), nullable=False)
    assignment_type = Column(String(40), default="quiz")  # quiz | exam | flashcards | lesson_plan
    content = Column(Text, nullable=False)
    total_marks = Column(Integer, default=15)
    total_questions = Column(Integer, default=5)
    due_date = Column(String(100), default="")
    status = Column(String(40), default="published")  # draft | published | archived
    assigned_to_class = Column(String(120), default="General Class")
    created_at = Column(DateTime, default=utcnow)

    teacher = relationship("User")
    submissions = relationship("LearnSubmission", back_populates="assignment")


class LearnSubmission(Base):
    __tablename__ = "learn_submissions"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("learn_assignments.id"), index=True, nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    student_name = Column(String(255), default="")
    answers_json = Column(JSON, default=dict)
    score = Column(Float, default=0.0)
    max_score = Column(Float, default=15.0)
    ai_grading_feedback = Column(Text, default="")
    teacher_remark = Column(Text, default="")
    status = Column(String(40), default="graded")  # submitted | graded | reviewed
    submitted_at = Column(DateTime, default=utcnow)

    assignment = relationship("LearnAssignment", back_populates="submissions")
    student = relationship("User")


class LearnDoubt(Base):
    __tablename__ = "learn_doubts"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    subject = Column(String(120), nullable=False)
    question = Column(Text, nullable=False)
    ai_hint_context = Column(Text, default="")
    teacher_reply = Column(Text, default="")
    status = Column(String(40), default="open")  # open | answered
    created_at = Column(DateTime, default=utcnow)

    student = relationship("User", foreign_keys=[student_id])
    teacher = relationship("User", foreign_keys=[teacher_id])


class LearnStudyMaterial(Base):
    __tablename__ = "learn_study_materials"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    subject = Column(String(120), default="")
    file_name = Column(String(255), default="")
    file_url = Column(String(512), default="")
    extracted_text = Column(Text, default="")
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User")


# ─── 4. AIMIKO WORKS (25 AUTONOMOUS WORKFORCE AGENTS) ─────────────────────────
class WorksAgentJob(Base):
    __tablename__ = "works_agent_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    agent_slug = Column(String(100), index=True, nullable=False)
    input_payload = Column(JSON, default=dict)
    output_result = Column(JSON, default=dict)
    execution_time_ms = Column(Integer, default=0)
    tokens_used = Column(Integer, default=0)
    status = Column(String(40), default="completed")  # running | completed | failed
    created_at = Column(DateTime, default=utcnow, index=True)

    user = relationship("User")


class WorksApiKey(Base):
    __tablename__ = "works_api_keys"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    key_prefix = Column(String(16), nullable=False)
    key_hash = Column(String(255), nullable=False)
    label = Column(String(120), default="Default Agent Key")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User")


# ─── 5. AIMIKO BUDDY (NOTES, PLANNER & SOCIAL) ────────────────────────────────
class BuddyNote(Base):
    __tablename__ = "buddy_notes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    title = Column(String(255), default="Untitled Note")
    content = Column(Text, default="")
    folder = Column(String(100), default="General")
    tags_json = Column(JSON, default=list)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    user = relationship("User")


class BuddyPlannerTask(Base):
    __tablename__ = "buddy_planner_tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    priority = Column(String(20), default="medium")  # low | medium | high
    scheduled_date = Column(String(50), default="")
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User")


class MikodinPost(Base):
    __tablename__ = "mikodin_posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    author_name = Column(String(255), default="")
    author_role = Column(String(100), default="")
    author_avatar = Column(String(512), default="")
    content = Column(Text, nullable=False)
    media_urls_json = Column(JSON, default=list)
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=utcnow, index=True)

    user = relationship("User")


class BuddyConversation(Base):
    __tablename__ = "buddy_conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    title = Column(String(255), default="New Conversation")
    mode = Column(String(50), default="chat")  # chat | voice | code | study
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    user = relationship("User")
    messages = relationship("BuddyMessage", back_populates="conversation", cascade="all, delete-orphan")


class BuddyMessage(Base):
    __tablename__ = "buddy_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("buddy_conversations.id"), index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    role = Column(String(20), nullable=False)  # user | assistant | system
    content = Column(Text, nullable=False)
    tokens_used = Column(Integer, default=0)
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=utcnow, index=True)

    conversation = relationship("BuddyConversation", back_populates="messages")
    user = relationship("User")


class CreatorAsset(Base):
    __tablename__ = "creator_assets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    asset_type = Column(String(50), index=True, nullable=False)  # thumbnail | seo_title | script | prompt
    title = Column(String(255), nullable=False)
    content_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=utcnow, index=True)

    user = relationship("User")


# ─── 6. AUDIT LOGS & CRM LEADS ────────────────────────────────────────────────
class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    company = Column(String(255), default="")
    email = Column(String(255), index=True, nullable=False)
    country = Column(String(120), default="")
    industry = Column(String(120), default="")
    service = Column(String(120), default="")
    requirements = Column(Text, default="")
    budget = Column(String(120), default="")
    message = Column(Text, default="")
    source = Column(String(60), default="web")
    status = Column(String(40), default="new")
    handled_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    created_at = Column(DateTime, default=utcnow)

    handled_by = relationship("User")
    organization = relationship("Organization")


class ContactSubmission(Base):
    __tablename__ = "contact_submissions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), index=True, nullable=False)
    subject = Column(String(255), default="")
    message = Column(Text, default="")
    status = Column(String(40), default="new")
    created_at = Column(DateTime, default=utcnow)


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    company = Column(String(255), default="")
    email = Column(String(255), index=True, nullable=False)
    country = Column(String(120), default="")
    industry = Column(String(120), default="")
    services = Column(JSON, default=list)
    status = Column(String(40), default="active")
    source_lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    created_at = Column(DateTime, default=utcnow)

    source_lead = relationship("Lead")
    organization = relationship("Organization")
    projects = relationship("Project", back_populates="customer")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    service = Column(String(120), default="")
    description = Column(Text, default="")
    status = Column(String(40), default="planning")
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    owner = relationship("User", back_populates="projects")
    customer = relationship("Customer", back_populates="projects")
    organization = relationship("Organization")


class UsageMetric(Base):
    __tablename__ = "usage_metrics"

    id = Column(Integer, primary_key=True, index=True)
    metric_type = Column(String(20), index=True)
    service = Column(String(120), default="")
    action = Column(String(120), default="")
    provider = Column(String(120), default="")
    model = Column(String(120), default="")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    cost_usd = Column(Float, default=0.0)
    status_code = Column(Integer, default=200)
    duration_ms = Column(Integer, default=0)
    created_at = Column(DateTime, default=utcnow, index=True)

class DemoSession(Base):
    __tablename__ = "demo_sessions"

    id = Column(Integer, primary_key=True, index=True)
    service = Column(String(120), nullable=False)
    session_id = Column(String(120), default="")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    actions = Column(Integer, default=0)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    actor_email = Column(String(255), default="")
    action = Column(String(120), index=True)
    resource_type = Column(String(120), default="")
    resource_id = Column(String(120), default="")
    details = Column(JSON, default=dict)
    ip_address = Column(String(64), default="")
    created_at = Column(DateTime, default=utcnow, index=True)

    actor = relationship("User")


# ─── 13. PRE-REGISTRATION / EARLY ACCESS ────────────────────────────────────
class PreRegistration(Base):
    __tablename__ = "pre_registrations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), index=True, nullable=False)
    otp_code = Column(String(10), default="")
    otp_expires_at = Column(DateTime, nullable=True)
    is_verified = Column(Boolean, default=False)
    queue_number = Column(Integer, unique=True, index=True, nullable=True)
    assigned_pose = Column(Integer, default=1)  # 1 to 5
    created_at = Column(DateTime, default=utcnow, index=True)
    verified_at = Column(DateTime, nullable=True)


class PreRegistrationChat(Base):
    __tablename__ = "pre_registration_chats"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(120), index=True, default="")
    user_message = Column(Text, nullable=False)
    bot_response = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utcnow, index=True)


