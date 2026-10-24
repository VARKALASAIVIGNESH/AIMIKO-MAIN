"""Public contact endpoints.

Creates leads and contact submissions that appear in the AIMIKO admin
dashboard. These are the only endpoints that do not require authentication,
and they accept limited fields (no auth bypass possible).
"""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import EmailStr
from sqlalchemy.orm import Session

from app.api.deps import get_client_ip
from app.core.database import get_db
from app.models import ContactSubmission, Lead
from app.schemas import ContactCreate, ContactOut, LeadCreate, LeadOut, MessageOut

router = APIRouter(tags=["contact"])


def _validate_email(email: str) -> None:
    try:
        EmailStr._validate(email)
    except Exception:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid email")


@router.post("/contact/leads", response_model=LeadOut)
def create_lead(payload: LeadCreate, request: Request, db: Session = Depends(get_db)):
    lead = Lead(
        name=payload.name.strip(),
        company=payload.company.strip(),
        email=payload.email.lower(),
        country=payload.country.strip(),
        industry=payload.industry.strip(),
        service=payload.service.strip(),
        requirements=payload.requirements.strip(),
        budget=payload.budget.strip(),
        message=payload.message.strip(),
        source="web",
        status="new",
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead


@router.post("/contact/messages", response_model=ContactOut)
def create_message(payload: ContactCreate, request: Request, db: Session = Depends(get_db)):
    submission = ContactSubmission(
        name=payload.name.strip(),
        email=payload.email.lower(),
        subject=payload.subject.strip(),
        message=payload.message.strip(),
        status="new",
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission
