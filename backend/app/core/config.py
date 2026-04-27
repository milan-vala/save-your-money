from typing import Literal
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True)

    gemini_api_key: str | None = None
    environment: str = "development"

    firebase_credentials_path: str | None = None
    firebase_credentials_json: str | None = None
    firebase_web_api_key: str = ""

    access_cookie_name: str = "fb_access"
    refresh_cookie_name: str = "fb_refresh"
    access_session_ttl_seconds: int = Field(default=3600, ge=300, le=14 * 24 * 3600)
    refresh_cookie_max_age_seconds: int = Field(default=14 * 24 * 3600, ge=60)

    cookie_samesite: Literal["lax", "strict", "none"] = "lax"
    cors_origins: str = "http://localhost:5173"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def cookie_secure(self) -> bool:
        return self.environment == "production"


settings = Settings()
