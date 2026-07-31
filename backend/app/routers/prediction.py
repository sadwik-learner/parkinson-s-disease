from __future__ import annotations

from fastapi import APIRouter

from app.schemas.prediction import PredictionResponse
from app.services.inference import build_placeholder_prediction

router = APIRouter(prefix="/predict", tags=["prediction"])


@router.post("", response_model=PredictionResponse)
async def predict() -> PredictionResponse:
    """Return a placeholder screening prediction."""
    return build_placeholder_prediction()
