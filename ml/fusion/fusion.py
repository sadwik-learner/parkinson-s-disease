"""Trainable or weighted late fusion for multimodal screening probabilities."""

from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression

from ml.configs.settings import ensure_runtime_directories, load_config


MODALITIES = ("spiral", "finger_tap", "pointer", "handwriting")


def _weighted_probabilities(values: dict[str, float | None], weights: dict[str, float]) -> float:
    available = {name: value for name, value in values.items() if value is not None}
    if not available: raise ValueError("At least one modality probability is required.")
    if any(not 0 <= float(value) <= 1 for value in available.values()): raise ValueError("Probabilities must be within [0, 1].")
    active_weights = {name: float(weights.get(name, 1.0)) for name in available}
    if any(weight < 0 for weight in active_weights.values()) or sum(active_weights.values()) == 0: raise ValueError("Active fusion weights must be non-negative and non-zero.")
    return float(sum(float(available[name]) * active_weights[name] for name in available) / sum(active_weights.values()))


def train(config_path: str | Path | None = None, paired_csv: str | Path | None = None) -> dict[str, object]:
    """Train logistic fusion if paired labels exist, otherwise persist weighted fusion."""
    config = load_config(config_path); paths = ensure_runtime_directories(config); settings = config["fusion"]
    candidate = Path(paired_csv) if paired_csv else Path(settings.get("paired_training_csv") or "")
    weights = settings.get("weights", {name: 1.0 for name in MODALITIES})
    checkpoint = paths.checkpoints_dir / settings["checkpoint_name"]
    if candidate and candidate.is_file():
        frame = pd.read_csv(candidate); columns = [f"{name}_probability" for name in MODALITIES]
        if "label" not in frame or not set(columns).issubset(frame.columns): raise ValueError(f"Paired fusion CSV needs label and columns: {', '.join(columns)}")
        clean = frame.dropna(subset=["label", *columns]); labels = clean["label"].astype(int)
        if labels.nunique() != 2: raise ValueError("Paired fusion labels must contain both classes.")
        model = LogisticRegression(class_weight="balanced", max_iter=2000, random_state=config["runtime"]["seed"])
        model.fit(clean[columns], labels)
        bundle = {"mode": "logistic", "model": model, "feature_names": columns}
    else:
        bundle = {"mode": "weighted", "weights": weights}
    joblib.dump(bundle, checkpoint)
    return {"checkpoint": str(checkpoint), "mode": bundle["mode"]}


def predict(probabilities: dict[str, float | None], config_path: str | Path | None = None) -> dict[str, object]:
    """Fuse named modality scores and return risk, confidence, and input scores."""
    config = load_config(config_path); paths = ensure_runtime_directories(config); bundle = joblib.load(paths.checkpoints_dir / config["fusion"]["checkpoint_name"])
    values = {name: probabilities.get(name) for name in MODALITIES}
    if bundle["mode"] == "logistic":
        row = np.array([[values[name] if values[name] is not None else 0.5 for name in MODALITIES]])
        probability = float(bundle["model"].predict_proba(row)[:, 1][0])
    else: probability = _weighted_probabilities(values, bundle["weights"])
    return {"final_risk_probability": probability, "predicted_class": "parkinson_risk" if probability >= .5 else "lower_risk", "confidence": max(probability, 1 - probability), "fusion_mode": bundle["mode"], "individual_predictions": values}
