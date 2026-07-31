from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import (
    ALLOWED_ORIGINS,
    API_PREFIX,
    API_TITLE,
    API_VERSION,
    HANDWRITING_UPLOAD_DIR,
    PREDICTION_UPLOAD_DIR,
    SPIRAL_UPLOAD_DIR,
)
from app.routers import handwriting, motion, prediction, spiral
from app.services.inference import inference_service
from app.utils.file_utils import ensure_upload_directories


def create_app() -> FastAPI:
    """Application factory for the Parkinson's AI backend."""
    
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        # Upload folders are created automatically so file routes can save safely.
        ensure_upload_directories(SPIRAL_UPLOAD_DIR, HANDWRITING_UPLOAD_DIR, PREDICTION_UPLOAD_DIR)
        inference_service.load_models()
        yield

    app = FastAPI(title=API_TITLE, version=API_VERSION, lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/")
    async def root() -> dict[str, str]:
        return {"message": "Parkinson AI Backend Running"}

    app.include_router(spiral.router, prefix=API_PREFIX)
    app.include_router(handwriting.router, prefix=API_PREFIX)
    app.include_router(motion.router, prefix=API_PREFIX)
    app.include_router(prediction.router, prefix=API_PREFIX)

    return app


app = create_app()
