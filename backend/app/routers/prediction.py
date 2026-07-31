"""File-upload endpoints for trained ML model inference."""

from __future__ import annotations

import logging
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile, status
from starlette.concurrency import run_in_threadpool

from app.config import PREDICTION_UPLOAD_DIR
from app.schemas.prediction import (
    CombinedPredictionResponse,
    FingerTapPredictionResponse,
    SpiralPrediction,
)
from app.services.inference import ModelUnavailableError, inference_service
from app.utils.file_utils import save_upload_file


LOGGER = logging.getLogger(__name__)
router = APIRouter(prefix="/predict", tags=["prediction"])


async def _save_temporary_upload(upload: UploadFile) -> Path:
    """Persist an uploaded file for inference and return its temporary path."""
    filename = await save_upload_file(upload, PREDICTION_UPLOAD_DIR)
    return PREDICTION_UPLOAD_DIR / filename


def _delete_temporary_file(path: Path | None) -> None:
    """Best-effort cleanup of an upload after inference completes."""
    if path is None:
        return
    try:
        path.unlink(missing_ok=True)
    except OSError:
        LOGGER.warning("Could not remove temporary upload %s", path)


def _http_error(exc: Exception) -> HTTPException:
    """Convert service exceptions into safe, useful HTTP responses."""
    if isinstance(exc, ModelUnavailableError):
        return HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))
    if isinstance(exc, (FileNotFoundError, ValueError)):
        return HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))
    LOGGER.exception("Unexpected prediction error", exc_info=exc)
    return HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Prediction could not be completed.")


@router.post("/spiral", response_model=SpiralPrediction)
async def predict_spiral(file: UploadFile = File(...)) -> dict[str, float | int | str]:
    """Run the spiral classifier against an uploaded image."""
    image_path: Path | None = None
    try:
        image_path = await _save_temporary_upload(file)
        LOGGER.info("Spiral prediction request received")
        return await run_in_threadpool(inference_service.predict_spiral, image_path)
    except Exception as exc:
        raise _http_error(exc) from exc
    finally:
        _delete_temporary_file(image_path)


@router.post("/finger-tap", response_model=FingerTapPredictionResponse)
async def predict_finger_tap(file: UploadFile = File(...)) -> dict[str, object]:
    """Run the finger-tap classifier against an uploaded Tappy event CSV."""
    csv_path: Path | None = None
    try:
        csv_path = await _save_temporary_upload(file)
        LOGGER.info("Finger-tap prediction request received")
        predictions = await run_in_threadpool(inference_service.predict_finger_tap, csv_path)
        return {"predictions": predictions}
    except Exception as exc:
        raise _http_error(exc) from exc
    finally:
        _delete_temporary_file(csv_path)


@router.post("", response_model=CombinedPredictionResponse)
async def predict_combined(
    spiral_image: UploadFile = File(...),
    finger_tap_file: UploadFile = File(...),
) -> dict[str, object]:
    """Run both models and return their equal-weight combined screening score."""
    image_path: Path | None = None
    csv_path: Path | None = None
    try:
        image_path = await _save_temporary_upload(spiral_image)
        csv_path = await _save_temporary_upload(finger_tap_file)
        LOGGER.info("Combined prediction request received")
        return await run_in_threadpool(inference_service.predict_combined, image_path, csv_path)
    except Exception as exc:
        raise _http_error(exc) from exc
    finally:
        _delete_temporary_file(image_path)
        _delete_temporary_file(csv_path)
