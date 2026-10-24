"""Smoke tests for the AIMIKO API (Phase 1).

Run from the repository root:
    .venv\\Scripts\\python -m pytest backend\\tests -q
"""

import os

_TEST_DB = "./test_aimiko.db"
if os.path.exists(_TEST_DB):
    os.remove(_TEST_DB)

os.environ.setdefault("DATABASE_URL", f"sqlite:///{_TEST_DB}")
os.environ.setdefault("ADMIN_PASSWORD", "TestAdmin123!")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402

ADMIN_EMAIL = "admin@aimiko.ai"
ADMIN_PASSWORD = "TestAdmin123!"


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_health(client):
    r = client.get("/api/v1/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_public_lead_creation(client):
    r = client.post(
        "/api/v1/contact/leads",
        json={
            "name": "Test Lead",
            "company": "Test Co",
            "email": "lead@example.com",
            "country": "US",
            "industry": "Retail",
            "service": "AI Automation",
            "requirements": "Automate onboarding",
            "budget": "$5k",
            "message": "hello",
        },
    )
    assert r.status_code == 200
    assert r.json()["status"] == "new"


def test_public_contact_message(client):
    r = client.post(
        "/api/v1/contact/messages",
        json={"name": "Jane", "email": "jane@example.com", "subject": "Hi", "message": "Question"},
    )
    assert r.status_code == 200


def test_register_login_me(client):
    r = client.post(
        "/api/v1/auth/register",
        json={"full_name": "New User", "company": "Acme", "email": "new@example.com", "password": "Password123!"},
    )
    assert r.status_code == 200

    r = client.post("/api/v1/auth/login", json={"email": "new@example.com", "password": "Password123!"})
    assert r.status_code == 200
    assert r.json()["user"]["email"] == "new@example.com"

    r = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer fake"})
    assert r.status_code == 401


def test_admin_endpoints(client):
    r = client.post("/api/v1/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text

    r = client.get("/api/v1/admin/summary")
    assert r.status_code == 200
    assert "leads_total" in r.json()

    r = client.get("/api/v1/admin/leads")
    assert r.status_code == 200
    assert r.json()["total"] >= 1

    r = client.get("/api/v1/admin/system/health")
    assert r.status_code == 200

    r = client.get("/api/v1/admin/components")
    assert r.status_code == 200
    assert len(r.json()) >= 6

    r = client.get("/api/v1/admin/audit-logs")
    assert r.status_code == 200


def test_app_scoping(client):
    r = client.post("/api/v1/auth/login", json={"email": "new@example.com", "password": "Password123!"})
    assert r.status_code == 200
    r = client.get("/api/v1/app/projects")
    assert r.status_code == 200

    r = client.post("/api/v1/app/projects", json={"name": "My Project", "service": "Document AI"})
    assert r.status_code == 201
    pid = r.json()["id"]
    r = client.get("/api/v1/app/projects")
    assert r.json()[0]["id"] == pid

    r = client.get("/api/v1/admin/summary")
    assert r.status_code == 403


def test_workspace_status(client):
    r = client.post("/api/v1/auth/login", json={"email": "new@example.com", "password": "Password123!"})
    r = client.get("/api/v1/app/workspace/documents")
    assert r.status_code == 200
    assert r.json()["area"] == "documents"
