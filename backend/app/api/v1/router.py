"""API v1 router aggregator."""

from fastapi import APIRouter

from app.api.v1 import admin, app as app_router, auth, billing, buddy, contact, health, preregister

router = APIRouter()
router.include_router(health.router)
router.include_router(preregister.router)
router.include_router(auth.router)
router.include_router(billing.router)
router.include_router(buddy.router)
router.include_router(contact.router)
router.include_router(app_router.router)
router.include_router(admin.router)
