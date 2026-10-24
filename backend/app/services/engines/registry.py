"""Engine registry.

Each AIMIKO service category maps to an isolated open-source engine that can
be enabled/configured independently. Engines that are not configured (no URL,
no credentials) report as "not_configured" and AIMIKO operates in development
fallback mode for that service area.

Do NOT expose this registry's actions to unauthenticated clients.
"""

from __future__ import annotations

import socket
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field
from typing import Callable, Optional

import httpx

from app.core.config import settings

ENGINES = [
    "activepieces",
    "document_chat",
    "dograh",
    "ai_infra_guard",
    "cvat",
    "opencv",
]


@dataclass
class EngineInfo:
    key: str
    name: str
    repo: str
    license: str
    service_area: str
    status: str = "not_configured"
    url: str = ""
    note: str = ""
    extras: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "key": self.key,
            "name": self.name,
            "repo": self.repo,
            "license": self.license,
            "service_area": self.service_area,
            "status": self.status,
            "url": self.url,
            "note": self.note,
        }


def _check_url(url: str) -> bool:
    if not url:
        return False
    try:
        with socket.create_connection((url.split("//")[-1].split(":")[0], int(url.rsplit(":", 1)[-1].split("/")[0])), timeout=2):
            return True
    except Exception:
        return False


def _probe(url: str, timeout: float = 1.5) -> bool:
    if not url:
        return False
    try:
        r = httpx.get(url, timeout=timeout, follow_redirects=True)
        return r.status_code < 500
    except Exception:
        return False


def _status_for(url: str) -> str:
    if not url:
        return "not_configured"
    return "online" if _probe(url) else "offline"


def build_engines() -> list[EngineInfo]:
    urls = {
        "activepieces": settings.engine_activepieces_url,
        "document_chat": settings.engine_document_chat_url,
        "dograh": settings.engine_dograh_url,
        "ai_infra_guard": settings.engine_ai_infra_guard_url,
        "cvat": settings.engine_cvat_url,
    }
    with ThreadPoolExecutor(max_workers=len(urls)) as pool:
        futures = {key: pool.submit(_status_for, url) for key, url in urls.items()}
        statuses = {key: fut.result() for key, fut in futures.items()}

    return [
        EngineInfo(
            key="activepieces",
            name="Activepieces",
            repo="https://github.com/activepieces/activepieces",
            license="MIT / Commercial dual",
            service_area="AI Automation",
            url=settings.engine_activepieces_url,
            status=statuses["activepieces"],
            note="Workflow/automation engine (Phase 2).",
        ),
        EngineInfo(
            key="document_chat",
            name="Document Chat System",
            repo="https://github.com/watat83/document-chat-system",
            license="MIT",
            service_area="Document AI",
            url=settings.engine_document_chat_url,
            status=statuses["document_chat"],
            note="Document RAG / Q&A engine (Phase 3).",
        ),
        EngineInfo(
            key="dograh",
            name="Dograh",
            repo="https://github.com/dograh-hq/dograh",
            license="BSD-2-Clause",
            service_area="Voice AI",
            url=settings.engine_dograh_url,
            status=statuses["dograh"],
            note="Voice agent engine (Phase 4). Telephony/STT/TTS providers remain configurable.",
        ),
        EngineInfo(
            key="ai_infra_guard",
            name="AI-Infra-Guard",
            repo="https://github.com/Tencent/AI-Infra-Guard",
            license="Apache-2.0",
            service_area="AI Security",
            url=settings.engine_ai_infra_guard_url,
            status=statuses["ai_infra_guard"],
            note="LLM/agent security assessment engine (Phase 7). Authenticated access only.",
        ),
        EngineInfo(
            key="cvat",
            name="CVAT",
            repo="https://github.com/cvat-ai/cvat",
            license="MIT",
            service_area="Computer Vision",
            url=settings.engine_cvat_url,
            status=statuses["cvat"],
            note="Dataset annotation/labeling (Phase 6).",
        ),
        EngineInfo(
            key="opencv",
            name="OpenCV",
            repo="https://github.com/opencv/opencv",
            license="Apache-2.0",
            service_area="Computer Vision",
            status="available" if settings.engine_opencv_available else "not_configured",
            note="Vision primitives (Phase 6).",
        ),
    ]


def engine_status_map() -> dict[str, str]:
    return {e.key: e.status for e in build_engines()}


def engine_url(key: str) -> str:
    m = {
        "activepieces": settings.engine_activepieces_url,
        "document_chat": settings.engine_document_chat_url,
        "dograh": settings.engine_dograh_url,
        "ai_infra_guard": settings.engine_ai_infra_guard_url,
        "cvat": settings.engine_cvat_url,
    }
    return m.get(key, "")
