"""Pydantic schemas (request/response contracts)."""

from datetime import datetime
from typing import Any, List, Optional

from pydantic import BaseModel, EmailStr, Field


# ---------- Auth ----------
class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)
    company: str = Field(default="", max_length=255)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: str = Field(default="student")
    country: str = Field(default="", max_length=120)
    industry: str = Field(default="", max_length=120)
    terms_accepted: bool = Field(default=False)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    google_id: str
    email: EmailStr
    full_name: str = ""
    avatar_url: str = ""
    role: str = "student"
    mode: str = "signup"  # "signup" or "signin"
    terms_accepted: bool = False
    credential: Optional[str] = None


class ProfileUpdateRequest(BaseModel):
    role: Optional[str] = None
    full_name: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    school_or_company: Optional[str] = None
    skills: Optional[str] = None
    groq_api_key: Optional[str] = None
    mikodin_terms_accepted: Optional[bool] = None


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    tier: str = "Free"
    avatar_url: Optional[str] = None
    google_id: Optional[str] = None
    headline: Optional[str] = ""
    bio: Optional[str] = ""
    location: Optional[str] = ""
    school_or_company: Optional[str] = ""
    skills: Optional[str] = ""
    groq_api_key: Optional[str] = ""
    mikodin_terms_accepted: Optional[bool] = False
    is_active: bool
    organization_id: Optional[int] = None
    organization_name: Optional[str] = None
    industry: Optional[str] = ""
    created_at: datetime

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    user: UserOut
    token: Optional[str] = None


class MessageOut(BaseModel):
    message: str


# ---------- Public contact ----------
class LeadCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    company: str = Field(default="", max_length=255)
    email: EmailStr
    country: str = Field(default="", max_length=120)
    industry: str = Field(default="", max_length=120)
    service: str = Field(default="", max_length=120)
    requirements: str = Field(default="", max_length=10000)
    budget: str = Field(default="", max_length=120)
    message: str = Field(default="", max_length=10000)


class LeadOut(BaseModel):
    id: int
    name: str
    company: str
    email: EmailStr
    country: str
    industry: str
    service: str
    requirements: str
    budget: str
    message: str
    source: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ContactCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    subject: str = Field(default="", max_length=255)
    message: str = Field(min_length=1, max_length=10000)


class ContactOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    subject: str
    message: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------- Projects ----------
class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    service: str = Field(default="", max_length=120)
    description: str = Field(default="", max_length=5000)
    status: str = Field(default="planning", max_length=40)


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    service: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class ProjectOut(BaseModel):
    id: int
    name: str
    service: str
    description: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ---------- Demo usage ----------
class DemoEvent(BaseModel):
    service: str = Field(min_length=1, max_length=120)
    session_id: str = Field(default="", max_length=120)
    action: str = Field(default="start", max_length=120)


# ---------- Usage ----------
class UsageRecord(BaseModel):
    metric_type: str
    service: str
    action: str
    provider: str = ""
    model: str = ""
    input_tokens: int = 0
    output_tokens: int = 0
    cost_usd: float = 0.0
    status_code: int = 200
    duration_ms: int = 0


class UsageOut(BaseModel):
    id: int
    metric_type: str
    service: str
    action: str
    provider: str
    model: str
    input_tokens: int
    output_tokens: int
    cost_usd: float
    status_code: int
    duration_ms: int
    created_at: datetime

    model_config = {"from_attributes": True}


class UsageStats(BaseModel):
    total_requests: int
    total_cost_usd: float
    total_tokens: int
    by_service: List[dict[str, Any]] = []
    by_day: List[dict[str, Any]] = []


# ---------- Admin ----------
class LeadStatusUpdate(BaseModel):
    status: str = Field(pattern="^(new|contacted|qualified|proposal|won|lost)$")


class CustomerOut(BaseModel):
    id: int
    name: str
    company: str
    email: EmailStr
    country: str
    industry: str
    services: List[str]
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class CustomerCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    company: str = Field(default="", max_length=255)
    email: EmailStr
    country: str = Field(default="", max_length=120)
    industry: str = Field(default="", max_length=120)
    services: List[str] = []
    status: str = Field(default="active", max_length=40)


class Page(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int


class SystemHealthOut(BaseModel):
    status: str
    checks: List[dict[str, Any]]


class ComponentOut(BaseModel):
    name: str
    purpose: str
    repository: str
    license: str
    status: str  # "integrated" | "planned" | "optional"
    note: str = ""


class AuditLogOut(BaseModel):
    id: int
    actor_email: str
    action: str
    resource_type: str
    resource_id: str
    details: dict[str, Any]
    ip_address: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------- AIMIKO Buddy ----------
class BuddyChatRequest(BaseModel):
    conversation_id: Optional[int] = None
    message: str = Field(min_length=1)
    role: Optional[str] = "student"
    age_group: Optional[str] = None
    mode: Optional[str] = "chat"


class BuddyChatResponse(BaseModel):
    conversation_id: int
    user_message: str
    ai_response: str
    tokens_used: int = 0
    created_at: datetime


class BuddyConversationOut(BaseModel):
    id: int
    title: str
    mode: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BuddyMessageOut(BaseModel):
    id: int
    conversation_id: int
    role: str
    content: str
    tokens_used: int
    created_at: datetime

    model_config = {"from_attributes": True}


class BuddyNoteCreate(BaseModel):
    title: str = Field(default="Untitled Note", max_length=255)
    content: str = ""
    folder: str = Field(default="General", max_length=100)
    tags: List[str] = []


class BuddyNoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    folder: Optional[str] = None
    tags: Optional[List[str]] = None


class BuddyNoteOut(BaseModel):
    id: int
    title: str
    content: str
    folder: str
    tags_json: List[str] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BuddyTaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    priority: str = Field(default="medium", pattern="^(low|medium|high)$")
    scheduled_date: str = Field(default="", max_length=50)


class BuddyTaskUpdate(BaseModel):
    title: Optional[str] = None
    priority: Optional[str] = None
    scheduled_date: Optional[str] = None
    is_completed: Optional[bool] = None


class BuddyTaskOut(BaseModel):
    id: int
    title: str
    priority: str
    scheduled_date: str
    is_completed: bool
    created_at: datetime

    model_config = {"from_attributes": True}
