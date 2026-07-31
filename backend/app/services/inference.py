"""Long-lived inference service for the trained screening models."""

from __future__ import annotations

import logging
import sys
from pathlib import Path
from time import perf_counter
from typing import Any


LOGGER = logging.getLogger(__name__)
PROJECT_ROOT = Path(__file__).resolve().parents[3]

# The backend is normally started from ``backend/`` while ``ml/`` is at the
# repository root.  Make the local ML package importable without hard-coded
# machine-specific paths.
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


class ModelUnavailableError(RuntimeError):
    """Raised when a requested model could not be loaded at application start."""


class InferenceService:
    """Load trained models once and provide synchronous inference methods.

    Individual checkpoint failures are recorded instead of preventing FastAPI
    from starting.  Routes translate :class:`ModelUnavailableError` into a
    service-unavailable response for the affected modality.
    """

    def __init__(self) -> None:
        self._models_loaded = False
        self._config: dict[str, Any] | None = None
        self._paths: Any | None = None
        self._spiral_model: Any | None = None
        self._spiral_transform: Any | None = None
        self._spiral_device: Any | None = None
        self._tappy_bundle: dict[str, Any] | None = None
        self._read_tappy_events: Any | None = None
        self._extract_tappy_features: Any | None = None
        self._errors: dict[str, str] = {}

    def load_models(self) -> None:
        """Load each available checkpoint once during the FastAPI lifespan."""
        if self._models_loaded:
            return
        self._models_loaded = True
        LOGGER.info("Loading ML models from %s", PROJECT_ROOT / "ml" / "checkpoints")

        try:
            from ml.configs.settings import get_paths, load_config

            self._config = load_config()
            self._paths = get_paths(self._config)
        except Exception as exc:  # Keep the HTTP service available for health checks.
            message = f"Unable to load ML configuration: {exc}"
            self._errors["spiral"] = message
            self._errors["finger_tap"] = message
            LOGGER.exception(message)
            return

        self._load_spiral_model()
        self._load_finger_tap_model()

    def _load_spiral_model(self) -> None:
        """Load the EfficientNet spiral checkpoint and deterministic transform."""
        try:
            import torch

            from ml.spiral.model import build_model
            from ml.spiral.preprocess import evaluation_transform
            from ml.spiral.utils import choose_device

            assert self._config is not None and self._paths is not None
            settings = self._config["spiral"]
            checkpoint_path = self._paths.checkpoints_dir / settings["checkpoint_name"]
            if not checkpoint_path.is_file():
                raise FileNotFoundError(f"Spiral checkpoint not found: {checkpoint_path}")

            device = choose_device(self._config["runtime"]["device"])
            checkpoint = torch.load(checkpoint_path, map_location=device, weights_only=False)
            model = build_model(pretrained=False).to(device)
            model.load_state_dict(checkpoint["model_state"])
            model.eval()

            self._spiral_model = model
            self._spiral_transform = evaluation_transform(settings["image_size"])
            self._spiral_device = device
            LOGGER.info("Loaded spiral model checkpoint: %s", checkpoint_path)
        except Exception as exc:
            self._errors["spiral"] = str(exc)
            LOGGER.exception("Unable to load spiral model")

    def _load_finger_tap_model(self) -> None:
        """Load the saved Tappy classifier bundle and its feature helpers."""
        try:
            import joblib

            from ml.tappy.feature_engineering import extract_user_features
            from ml.tappy.predict import _read_events

            assert self._config is not None and self._paths is not None
            checkpoint_path = self._paths.checkpoints_dir / self._config["tappy"]["checkpoint_name"]
            if not checkpoint_path.is_file():
                raise FileNotFoundError(f"Finger-tap checkpoint not found: {checkpoint_path}")

            bundle = joblib.load(checkpoint_path)
            required_keys = {"model", "preprocessor", "feature_names"}
            if not required_keys.issubset(bundle):
                raise ValueError("Finger-tap checkpoint has an unexpected format.")

            self._tappy_bundle = bundle
            self._read_tappy_events = _read_events
            self._extract_tappy_features = extract_user_features
            LOGGER.info("Loaded finger-tap model checkpoint: %s", checkpoint_path)
        except Exception as exc:
            self._errors["finger_tap"] = str(exc)
            LOGGER.exception("Unable to load finger-tap model")

    def _require_model(self, name: str, model: Any | None) -> None:
        """Raise a clear error when a modality is unavailable."""
        if model is None:
            detail = self._errors.get(name, "The model has not been loaded.")
            raise ModelUnavailableError(f"{name.replace('_', '-')} model is unavailable: {detail}")

    def predict_spiral(self, image_path: Path) -> dict[str, float | int | str]:
        """Predict Parkinson's screening risk from one spiral image."""
        self._require_model("spiral", self._spiral_model)
        if not image_path.is_file():
            raise FileNotFoundError(f"Image not found: {image_path}")

        started = perf_counter()
        try:
            import torch
            from PIL import Image

            assert self._spiral_model is not None
            assert self._spiral_transform is not None
            assert self._spiral_device is not None
            with Image.open(image_path) as image, torch.no_grad():
                tensor = self._spiral_transform(image.convert("RGB")).unsqueeze(0).to(self._spiral_device)
                probability = float(torch.sigmoid(self._spiral_model(tensor).squeeze()).item())
            result: dict[str, float | int | str] = {
                "predicted_class": "parkinson_risk" if probability >= 0.5 else "lower_risk",
                "class_id": int(probability >= 0.5),
                "probability": probability,
                "confidence": float(max(probability, 1 - probability)),
            }
            return result
        except Exception:
            LOGGER.exception("Spiral prediction failed for %s", image_path.name)
            raise
        finally:
            LOGGER.info("Spiral inference completed in %.3fs", perf_counter() - started)

    def predict_finger_tap(self, file_path: Path) -> list[dict[str, float | str]]:
        """Predict screening risk for each participant in a Tappy event CSV."""
        self._require_model("finger_tap", self._tappy_bundle)
        if not file_path.is_file():
            raise FileNotFoundError(f"CSV not found: {file_path}")

        started = perf_counter()
        try:
            assert self._tappy_bundle is not None
            assert self._read_tappy_events is not None
            assert self._extract_tappy_features is not None
            features, user_ids = self._extract_tappy_features(self._read_tappy_events(file_path))
            if features.empty:
                raise ValueError("The CSV does not contain usable finger-tap events.")
            ordered_features = features.reindex(columns=self._tappy_bundle["feature_names"])
            transformed_features = self._tappy_bundle["preprocessor"].transform(ordered_features)
            probabilities = self._tappy_bundle["model"].predict_proba(transformed_features)[:, 1]
            return [
                {
                    "user_id": str(user_id),
                    "predicted_class": "parkinson_risk" if float(probability) >= 0.5 else "lower_risk",
                    "probability": float(probability),
                    "confidence": float(max(float(probability), 1 - float(probability))),
                }
                for user_id, probability in zip(user_ids.tolist(), probabilities.tolist(), strict=True)
            ]
        except Exception:
            LOGGER.exception("Finger-tap prediction failed for %s", file_path.name)
            raise
        finally:
            LOGGER.info("Finger-tap inference completed in %.3fs", perf_counter() - started)

    def predict_combined(self, image_path: Path, file_path: Path) -> dict[str, Any]:
        """Return spiral, finger-tap, and equal-weight combined predictions."""
        started = perf_counter()
        LOGGER.info("Combined prediction requested")
        try:
            spiral = self.predict_spiral(image_path)
            finger_tap = self.predict_finger_tap(file_path)
            combined = []
            for prediction in finger_tap:
                probability = (float(spiral["probability"]) + float(prediction["probability"])) / 2
                combined.append(
                    {
                        "user_id": prediction["user_id"],
                        "predicted_class": "parkinson_risk" if probability >= 0.5 else "lower_risk",
                        "probability": probability,
                        "confidence": max(probability, 1 - probability),
                    }
                )
            return {"spiral": spiral, "finger_tap": finger_tap, "combined": combined}
        finally:
            LOGGER.info("Combined inference completed in %.3fs", perf_counter() - started)


inference_service = InferenceService()
