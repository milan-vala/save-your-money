from __future__ import annotations
import httpx

class SecureTokenError(Exception):
    def __init__(self, message: str, *, status_code: int | None = None) -> None:
        super().__init__(message)
        self.status_code = status_code

async def exchange_refresh_token(
    *, refresh_token: str, web_api_key: str
) -> dict[str, str]:
    if not web_api_key:
        raise SecureTokenError("Firebase web API key is not configured")
    url = f"https://securetoken.googleapis.com/v1/token?key={web_api_key}"
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            url,
            data={
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
    try:
        payload = response.json()
    except ValueError as exc:
        raise SecureTokenError("Invalid token response") from exc

    if response.status_code != 200:
        err = payload.get("error", {})
        message = err.get("message", response.text) if isinstance(err, dict) else response.text
        raise SecureTokenError(str(message), status_code=response.status_code)

    id_token = payload.get("id_token")
    if not id_token or not isinstance(id_token, str):
        raise SecureTokenError("Token response missing id_token")

    out: dict[str, str] = {"id_token": id_token}
    new_refresh = payload.get("refresh_token")
    if isinstance(new_refresh, str) and new_refresh:
        out["refresh_token"] = new_refresh
    return out
