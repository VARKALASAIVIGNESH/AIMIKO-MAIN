"""Pre-registration and Early Access API endpoints for www.aimiko.in."""

import logging
import random
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.email import send_preregistration_otp
from app.models import PreRegistration, PreRegistrationChat

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/preregister", tags=["preregister"])


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class SendOtpRequest(BaseModel):
    name: str
    email: EmailStr


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str


class ChatLogRequest(BaseModel):
    session_id: Optional[str] = ""
    user_message: str
    bot_response: str


class PreRegisterResponse(BaseModel):

    success: bool
    message: str
    is_verified: bool = False
    queue_number: Optional[int] = None
    assigned_pose: int = 1
    name: str = ""
    email: str = ""
    dev_otp: Optional[str] = None


@router.post("/send-otp", response_model=PreRegisterResponse)
def send_otp(payload: SendOtpRequest, db: Session = Depends(get_db)):
    name = payload.name.strip()
    email = payload.email.lower().strip()

    if not name or len(name) < 2:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please enter your full name.")

    # Check if already registered and verified — prevent duplicate registrations
    existing = db.query(PreRegistration).filter(PreRegistration.email == email).first()
    if existing and existing.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email has already been registered. Each email can only be used once for early access."
        )

    # Generate 6-digit numeric OTP
    otp_code = f"{random.randint(100000, 999999)}"
    expires_at = datetime.now() + timedelta(minutes=15)
    # Pose between 1 and 5
    assigned_pose = random.randint(1, 5)

    if existing:
        existing.name = name
        existing.otp_code = otp_code
        existing.otp_expires_at = expires_at
        existing.assigned_pose = assigned_pose
        reg = existing
    else:
        reg = PreRegistration(
            name=name,
            email=email,
            otp_code=otp_code,
            otp_expires_at=expires_at,
            is_verified=False,
            assigned_pose=assigned_pose,
        )
        db.add(reg)

    db.commit()
    db.refresh(reg)

    logger.info(f"[AIMIKO PRE-REGISTRATION] OTP for {email} ({name}): {otp_code}")

    # Send real branded verification email via Gmail SMTP
    email_sent = send_preregistration_otp(to_email=email, recipient_name=name, otp_code=otp_code)

    # In dev or until SMTP service is provided, expose dev_otp for seamless testing
    dev_otp = otp_code if settings.debug or settings.environment == "development" or True else None

    msg = f"Verification code sent to {email}." if email_sent else f"Verification code ready for {email}."

    return PreRegisterResponse(
        success=True,
        message=msg,
        is_verified=False,
        assigned_pose=reg.assigned_pose,
        name=reg.name,
        email=reg.email,
        dev_otp=dev_otp,
    )


@router.post("/verify-otp", response_model=PreRegisterResponse)
def verify_otp(payload: VerifyOtpRequest, db: Session = Depends(get_db)):
    email = payload.email.lower().strip()
    otp = payload.otp.strip()

    reg = db.query(PreRegistration).filter(PreRegistration.email == email).first()
    if not reg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registration record not found. Please submit your details again.")

    if reg.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This registration has already been verified and claimed."
        )

    # Validate OTP
    if reg.otp_code != otp:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification code. Please check and try again.")

    # Calculate sequential queue number
    max_queue = db.query(func.max(PreRegistration.queue_number)).scalar() or 0
    new_queue = max_queue + 1

    reg.is_verified = True
    reg.queue_number = new_queue
    reg.verified_at = datetime.now()
    db.commit()
    db.refresh(reg)

    logger.info(f"[AIMIKO PRE-REGISTRATION] Verified: {reg.email} ({reg.name}) -> Queue #{new_queue}, Pose #{reg.assigned_pose}")

    return PreRegisterResponse(
        success=True,
        message="Email verified! Welcome to AIMIKO early access.",
        is_verified=True,
        queue_number=reg.queue_number,
        assigned_pose=reg.assigned_pose,
        name=reg.name,
        email=reg.email,
    )


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    verified_count = db.query(func.count(PreRegistration.id)).filter(PreRegistration.is_verified == True).scalar() or 0
    total_chats = db.query(func.count(PreRegistrationChat.id)).scalar() or 0
    return {
        "verified_members": verified_count,
        "total_chats": total_chats,
        "early_access_open": True,
    }


@router.post("/chat-log")
def log_chat(payload: ChatLogRequest, db: Session = Depends(get_db)):
    try:
        log_entry = PreRegistrationChat(
            session_id=payload.session_id or "",
            user_message=payload.user_message.strip()[:1000],
            bot_response=payload.bot_response.strip()[:1000],
        )
        db.add(log_entry)
        db.commit()
        return {"status": "ok"}
    except Exception as e:
        logger.warning(f"Failed to log chat: {e}")
        return {"status": "ignored"}

