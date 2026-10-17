
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
)

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Campus digital twin and simulation platform",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "app": settings.app_name,
        "message": "Campus OS API is running",
        "docs": "/docs",
    }


@app.get("/api/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "ok",
            "app": settings.app_name,
            "version": settings.app_version,
            "database": {
                "status": "connected",
                "engine": "PostgreSQL",
            },
        }

    except SQLAlchemyError:
        return JSONResponse(
            status_code=503,
            content={
                "status": "degraded",
                "app": settings.app_name,
                "version": settings.app_version,
                "database": {
                    "status": "disconnected",
                    "engine": "PostgreSQL",
                },
                "message": "Database connectivity check failed.",
            },
        )
