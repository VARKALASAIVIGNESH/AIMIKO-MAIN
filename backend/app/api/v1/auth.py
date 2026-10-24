"""Authentication endpoints.

- register: creates an organization (tenant) + user, returns token as cookie.
- login: verifies credentials, returns token as cookie.
- me: current user.
- logout: clears the cookie (client side, stateless).
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_client_ip, get_current_user
from app.core.audit import log_audit
from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models import Organization, User
from app.schemas import AuthResponse, GoogleAuthRequest, LoginRequest, MessageOut, ProfileUpdateRequest, RegisterRequest, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


def _set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=settings.auth_cookie_name,
        value=token,
        max_age=settings.access_token_expire_minutes * 60,
        httponly=True,
        secure=settings.auth_cookie_secure,
        samesite=settings.auth_cookie_same_site,
        path="/",
    )


def _user_out(user: User) -> UserOut:
    data = UserOut.model_validate(user, from_attributes=True)
    if user.organization:
        data.industry = user.organization.industry or ""
        data.organization_name = user.organization.name or ""
    return data


@router.post("/register", response_model=AuthResponse)
def register(payload: RegisterRequest, response: Response, request: Request, db: Session = Depends(get_db)):
    if not payload.terms_accepted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must review and accept AIMIKO's Terms of Service and Privacy Policy to create an account."
        )

    if db.query(User).filter(User.email == payload.email.lower()).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    org = Organization(
        name=payload.company or f"{payload.full_name}'s workspace",
        country=payload.country,
        industry=payload.industry,
    )
    db.add(org)
    db.flush()

    user = User(
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        role=payload.role or "student",
        tier="Free",
        is_verified=True,
        organization_id=org.id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(str(user.id), {"role": user.role, "org": user.organization_id})
    _set_auth_cookie(response, token)

    log_audit(db, user.id, user.email, "auth.register", "user", str(user.id), {"org": org.id}, get_client_ip(request))
    return AuthResponse(user=_user_out(user), token=token)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, response: Response, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email. Please create an account first."
        )
    if not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password. Please check your password."
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")

    user.last_login_at = datetime.now(timezone.utc)
    db.commit()

    token = create_access_token(str(user.id), {"role": user.role, "org": user.organization_id})
    _set_auth_cookie(response, token)

    log_audit(db, user.id, user.email, "auth.login", "user", str(user.id), {}, get_client_ip(request))
    return AuthResponse(user=_user_out(user), token=token)


@router.post("/google", response_model=AuthResponse)
def google_auth(payload: GoogleAuthRequest, response: Response, request: Request, db: Session = Depends(get_db)):
    """Authenticate or register seamlessly via Google OAuth."""
    user = (
        db.query(User)
        .filter((User.google_id == payload.google_id) | (User.email == payload.email.lower()))
        .first()
    )

    # 1. Sign-in mode: user must already exist!
    if payload.mode == "signin" and not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No AIMIKO account found for this Google email. Please create an account first."
        )

    # 2. Signup mode: user must accept terms to create account
    if not user:
        if not payload.terms_accepted:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You must review and accept AIMIKO's Terms of Service and Privacy Policy to create an account."
            )

        # Create organization for new Google user
        org = Organization(name=f"{payload.full_name or 'User'}'s workspace")
        db.add(org)
        db.flush()

        user = User(
            email=payload.email.lower(),
            password_hash="oauth_google_identity",
            google_id=payload.google_id,
            full_name=payload.full_name or payload.email.split("@")[0],
            avatar_url=payload.avatar_url or "",
            role=payload.role or "student",
            tier="Free",
            is_verified=True,
            organization_id=org.id,
        )
        db.add(user)
        db.flush()
        action_name = "auth.google_register"
    else:
        # Link google_id if not present
        if not user.google_id:
            user.google_id = payload.google_id
        if payload.avatar_url and not user.avatar_url:
            user.avatar_url = payload.avatar_url
        user.last_login_at = datetime.now(timezone.utc)
        action_name = "auth.google_login"

    db.commit()
    db.refresh(user)

    token = create_access_token(str(user.id), {"role": user.role, "org": user.organization_id})
    _set_auth_cookie(response, token)

    log_audit(db, user.id, user.email, action_name, "user", str(user.id), {}, get_client_ip(request))
    return AuthResponse(user=_user_out(user), token=token)


@router.get("/me", response_model=AuthResponse)
def me(user: User = Depends(get_current_user)):
    return AuthResponse(user=_user_out(user))


@router.patch("/profile", response_model=AuthResponse)
def update_profile(
    payload: ProfileUpdateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update active user role and profile details."""
    if payload.role is not None:
        user.role = payload.role
    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.headline is not None:
        user.headline = payload.headline
    if payload.bio is not None:
        user.bio = payload.bio
    if payload.location is not None:
        user.location = payload.location
    if payload.school_or_company is not None:
        user.school_or_company = payload.school_or_company
    if payload.skills is not None:
        user.skills = payload.skills
    if payload.groq_api_key is not None:
        user.groq_api_key = payload.groq_api_key
    if payload.mikodin_terms_accepted is not None:
        user.mikodin_terms_accepted = payload.mikodin_terms_accepted

    db.commit()
    db.refresh(user)

    from app.services.json_store import JSONStore
    JSONStore.dump_all(db)

    return AuthResponse(user=_user_out(user))


@router.post("/logout", response_model=MessageOut)
def logout(response: Response):
    response.delete_cookie(key=settings.auth_cookie_name, path="/")
    return MessageOut(message="Signed out")
