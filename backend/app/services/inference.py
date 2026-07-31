"""Placeholder service module for future ML inference integration."""

from __future__ import annotations

from app.schemas.prediction import PredictionResponse


def build_placeholder_prediction() -> PredictionResponse:
    """Return a static prediction payload until ML inference is integrated."""
    return PredictionResponse(
        overallRisk=32,
        confidence=94,
        spiral=34,
        handwriting=30,
        motion=36,
        riskLevel="Low",
    )
