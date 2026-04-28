from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.loan_accounts import router as loan_accounts_router
from app.core.config import settings
from app.core.firebase import init_firebase_app


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_firebase_app(
        credentials_path=settings.firebase_credentials_path,
        credentials_json=settings.firebase_credentials_json,
    )
    yield


app = FastAPI(
    title="Save Your Money - Loan Intelligence API",
    description="Agentic AI for loan amortization analysis & savings insights",
    version="0.1.0",
    contact={
        "name": "Save Your Money",
        "url": "https://saveyourmoney.com",
        "email": "info@saveyourmoney.com",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=86400,
)

app.include_router(auth_router, prefix="/api")
app.include_router(loan_accounts_router, prefix="/api")


@app.get("/")
async def root():
    return {
        "message": "🚀 Save Your Money API is running!",
        "status": "healthy",
        "docs_url": "/docs",
        "environment": settings.environment,
    }


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "version": "0.1.0",
    }
