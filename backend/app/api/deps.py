"""AIMIKO API dependencies: auth, roles, tenant scoping."""

from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import decode_token
from app.models import User

_bearer = HTTPBearer(auto_error=False)


def _token_from_cookie(request: Request) -> Optional[str]:
    return request.cookies.get(settings.auth_cookie_name)


def get_token(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
) -> Optional[str]:
    if credentials:
        return credentials.credentials
    return _token_from_cookie(request)


def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    token = None
    if credentials:
        token = credentials.credentials
    else:
        token = request.cookies.get(settings.auth_cookie_name)

    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    user = db.query(User).filter(User.id == int(payload.get("sub", 0))).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or inactive user")
    return user


def get_optional_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
    db: Session = Depends(get_db),
) -> Optional[User]:
    token = None
    if credentials:
        token = credentials.credentials
    else:
        token = request.cookies.get(settings.auth_cookie_name)

    if not token:
        return None
    payload = decode_token(token)
    if not payload:
        return None
    user = db.query(User).filter(User.id == int(payload.get("sub", 0))).first()
    if not user or not user.is_active:
        return None
    return user


def get_current_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else ""
