from __future__ import annotations
from typing import Any
from fastapi import HTTPException, Request
from firebase_admin import auth
from app.core.config import settings
from app.core.firebase import firebase_app_ready

async def get_current_user(request: Request) -> dict[str, Any]:
    if not firebase_app_ready():
        raise HTTPException(status_code=503, detail="Authentication is not configured")
    token = request.cookies.get(settings.access_cookie_name)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        return auth.verify_session_cookie(token, check_revoked=True)
    except (
        auth.InvalidSessionCookieError,
        auth.RevokedSessionCookieError,
        auth.ExpiredSessionCookieError,
    ) as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired session") from exc
