from __future__ import annotations
from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from firebase_admin import auth
from pydantic import BaseModel, ConfigDict, Field
from starlette.responses import JSONResponse

from app.api.auth.deps import get_current_user
from app.core.config import settings
from app.core.firebase import firebase_app_ready
from app.services.firebase_token import SecureTokenError, exchange_refresh_token

router = APIRouter(prefix="/auth", tags=["auth"])

class SessionBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id_token: str = Field(alias="idToken")
    refresh_token: str = Field(alias="refreshToken")


def _session_cookie_value(raw: str | bytes) -> str:
    if isinstance(raw, bytes):
        return raw.decode("utf-8")
    return raw

def _attach_auth_cookies(
    response: Response, *, session_cookie: str | bytes, refresh_token: str
) -> None:
    session_value = _session_cookie_value(session_cookie)
    response.set_cookie(
        key=settings.access_cookie_name,
        value=session_value,
        max_age=settings.access_session_ttl_seconds,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        path="/",
    )
    response.set_cookie(
        key=settings.refresh_cookie_name,
        value=refresh_token,
        max_age=settings.refresh_cookie_max_age_seconds,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        path="/",
    )

def _clear_auth_cookies(response: Response) -> None:
    for name in (settings.access_cookie_name, settings.refresh_cookie_name):
        response.delete_cookie(
            name,
            path="/",
            secure=settings.cookie_secure,
            httponly=True,
            samesite=settings.cookie_samesite,
        )

def _require_firebase() -> None:
    if not firebase_app_ready():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is not configured",
        )

def _json_401_cleared(detail: str) -> JSONResponse:
    res = JSONResponse(status_code=401, content={"detail": detail})
    _clear_auth_cookies(res)
    return res

@router.post("/session", status_code=status.HTTP_204_NO_CONTENT)
async def create_session(body: SessionBody, response: Response) -> None:
    _require_firebase()
    if not body.refresh_token.strip():
        raise HTTPException(status_code=400, detail="refreshToken is required")
    try:
        auth.verify_id_token(body.id_token)
    except (auth.InvalidIdTokenError, ValueError) as exc:
        raise HTTPException(status_code=401, detail="Invalid ID token") from exc

    expires = timedelta(seconds=settings.access_session_ttl_seconds)
    try:
        session_cookie = auth.create_session_cookie(body.id_token, expires_in=expires)
    except (auth.InvalidIdTokenError, ValueError) as exc:
        raise HTTPException(status_code=401, detail="Invalid ID token") from exc

    _attach_auth_cookies(
        response, session_cookie=session_cookie, refresh_token=body.refresh_token
    )

@router.post("/refresh", response_model=None)
async def refresh_session(request: Request, response: Response) -> JSONResponse | None:
    _require_firebase()
    refresh = request.cookies.get(settings.refresh_cookie_name)
    if not refresh:
        return _json_401_cleared("Missing refresh token")

    try:
        tokens = await exchange_refresh_token(
            refresh_token=refresh, web_api_key=settings.firebase_web_api_key
        )
    except SecureTokenError:
        return _json_401_cleared("Refresh failed")

    id_token = tokens["id_token"]
    try:
        auth.verify_id_token(id_token)
    except (auth.InvalidIdTokenError, ValueError):
        return _json_401_cleared("Invalid refreshed ID token")

    expires = timedelta(seconds=settings.access_session_ttl_seconds)
    try:
        session_cookie = auth.create_session_cookie(id_token, expires_in=expires)
    except (auth.InvalidIdTokenError, ValueError):
        return _json_401_cleared("Could not create session")

    new_refresh = tokens.get("refresh_token", refresh)
    _attach_auth_cookies(response, session_cookie=session_cookie, refresh_token=new_refresh)
    response.status_code = status.HTTP_204_NO_CONTENT
    return None

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(request: Request, response: Response) -> None:
    _require_firebase()
    access = request.cookies.get(settings.access_cookie_name)
    if access:
        try:
            decoded = auth.verify_session_cookie(access, check_revoked=False)
            uid = decoded.get("uid")
            if isinstance(uid, str) and uid:
                auth.revoke_refresh_tokens(uid)
        except (
            auth.InvalidSessionCookieError,
            auth.RevokedSessionCookieError,
            auth.ExpiredSessionCookieError,
        ):
            pass
    _clear_auth_cookies(response)

@router.get("/me")
async def auth_me(user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any]:
    return {
        "uid": user.get("uid"),
        "email": user.get("email"),
    }
