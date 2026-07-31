from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class MotionPoint(BaseModel):
    x: float
    y: float
    timestamp: float | None = None


class MotionPayload(BaseModel):
    points: list[MotionPoint] = Field(default_factory=list)
    metadata: dict[str, Any] | None = None

