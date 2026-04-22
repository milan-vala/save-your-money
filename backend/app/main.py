from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True)

    gemini_api_key: str | None = None
    environment: str = "development"

settings = Settings()

app = FastAPI(
    title="Save Your Money - Loan Intelligence API",
    description="Agentic AI for loan amortization analysis & savings insights",
    version="0.1.0",
    contact={
        "name": "Save Your Money",
        "url": "https://saveyourmoney.com",
        "email": "info@saveyourmoney.com"
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT"
    }
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "🚀 Save Your Money API is running!",
        "status": "healthy",
        "docs_url": "/docs",
        "environment": settings.environment
    }

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "version": "0.1.0"
    }