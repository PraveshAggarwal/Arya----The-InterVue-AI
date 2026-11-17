
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db import connect_db, disconnect_db

from app.routes import (
    health,
    resume,
    question,
    interview,
)


@asynccontextmanager
async def lifespan(app: FastAPI):

    print("InterVue AI service starting...")
    await connect_db()

    yield

    await disconnect_db()
    print("InterVue AI service shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "AI-powered interview question generation from job descriptions and parsed resumes."
    ),
    version="1.0.0",
    debug=settings.DEBUG,
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"]
)


app.include_router(
    health.router,
    prefix="/api"
)

app.include_router(
    resume.router,
    prefix="/api"
)

app.include_router(
    question.router,
    prefix="/api"
)

app.include_router(
    interview.router,
    prefix="/api"
)


@app.get("/")
async def root():

    return {
        "success": True,
        "message": "Welcome to InterVue AI",
        "version": "1.0.0",
        "documentation": "/docs"
    }
