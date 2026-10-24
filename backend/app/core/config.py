"""Application settings.

Everything is configurable through environment variables / a .env file.
Secrets must never be committed; see .env.example.
"""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "AIMIKO API"
    app_version: str = "0.1.0"
    api_v1_prefix: str = "/api/v1"
    environment: str = "development"
    debug: bool = False

    # Database (PostgreSQL in production, SQLite for zero-dependency local dev)
    database_url: str = "sqlite:///./aimiko.db"

    # Authentication
    jwt_secret_key: str = "aimiko-change-this-secret-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days
    auth_cookie_name: str = "aimiko_token"
    auth_cookie_secure: bool = False  # set True behind HTTPS in production
    auth_cookie_same_site: str = "lax"

    # CORS
    frontend_origins: List[str] = [
        "http://localhost:8080",
        "http://localhost:8081",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:8081",
        "http://localhost:3000",
    ]

    # Supabase Cloud PostgreSQL
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""

    # Google OAuth2 Authentication
    google_client_id: str = ""
    google_client_secret: str = ""

    # Payments & Gateways
    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""
    stripe_publishable_key: str = ""
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""

    # Bootstrap admin (created on startup when absent)
    admin_email: str = "admin@aimiko.ai"
    admin_password: str = "AimikoAdmin123!"
    admin_full_name: str = "AIMIKO Admin"

    # Storage abstraction
    storage_backend: str = "local"  # "local" | "s3"
    storage_local_root: str = "./storage"
    storage_s3_bucket: str = ""
    storage_s3_region: str = "us-east-1"
    storage_s3_access_key: str = ""
    storage_s3_secret_key: str = ""
    storage_public_base_url: str = ""

    # Optional queue/cache (unused locally without Redis)
    redis_url: str = "redis://localhost:6379/0"

    # --- Open-source engine endpoints (each engine is isolated and optional) ---
    engine_activepieces_url: str = "http://localhost:3001"
    engine_document_chat_url: str = "http://localhost:8010"
    engine_dograh_url: str = "http://localhost:8020"
    engine_ai_infra_guard_url: str = "http://localhost:8030"
    engine_cvat_url: str = "http://localhost:8080"
    engine_opencv_available: bool = True

    # --- AI provider configuration (needed to run real AI work; never commit keys) ---
    llm_provider: str = ""  # e.g. "openai" | "anthropic" | "" (empty = dev fallback)
    llm_api_key: str = ""
    llm_default_model: str = "gpt-4o-mini"

    # --- SMTP Email Configuration (e.g. Gmail App Password) ---
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from_name: str = "AIMIKO"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
