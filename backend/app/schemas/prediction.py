"""Pydantic response models for ML prediction endpoints."""

from __future__ import annotations

from pydantic import BaseModel, Field


class SpiralPrediction(BaseModel):
    """Prediction returned for one spiral drawing."""

    predicted_class: str
    class_id: int = Field(ge=0, le=1)
    probability: float = Field(ge=0, le=1)
    confidence: float = Field(ge=0, le=1)


class FingerTapParticipantPrediction(BaseModel):
    """Prediction returned for one participant in a Tappy CSV."""

    user_id: str
    predicted_class: str
    probability: float = Field(ge=0, le=1)
    confidence: float = Field(ge=0, le=1)


class FingerTapPredictionResponse(BaseModel):
    """Response containing every participant represented in an uploaded CSV."""

    predictions: list[FingerTapParticipantPrediction]


class CombinedPredictionResponse(BaseModel):
    """Response containing both modality scores and equal-weight fusion scores."""

    spiral: SpiralPrediction
    finger_tap: list[FingerTapParticipantPrediction]
    combined: list[FingerTapParticipantPrediction]
