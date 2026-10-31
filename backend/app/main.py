import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import init_db

logger = logging.getLogger("brightloop")


@asynccontextmanager
async def lifespan(_: FastAPI):
    try:
        init_db()
    except Exception:
        logger.warning("Database initialization skipped because PostgreSQL is not available yet.")
    yield


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="Brightloop backend for subscription and billing automation.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "Brightloop API is running"}
