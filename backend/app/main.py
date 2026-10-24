"""AIMIKO API entrypoint."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import router
from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.seed import seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        from app.services.json_store import JSONStore
        JSONStore.load_all(db)
        seed(db)
        JSONStore.dump_all(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AIMIKO AI agency platform API. Public endpoints for contact/leads; authenticated app and admin endpoints.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins if settings.environment == "production" else ["*"],
    allow_origin_regex=r"https?://.*" if settings.environment == "production" else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix=settings.api_v1_prefix)


@app.get("/")
def root():
    return {"service": settings.app_name, "docs": "/docs", "health": "/api/v1/health"}
