"""Tappy event CSV inference."""

from __future__ import annotations

import argparse
from pathlib import Path

import joblib
import pandas as pd

from ml.configs.settings import ensure_runtime_directories, load_config
from ml.tappy.feature_engineering import extract_user_features


def _read_events(path: Path) -> pd.DataFrame:
    frame = pd.read_csv(path)
    required = {"user_id", "date", "time", "key", "hold_ms", "direction", "flight_ms", "latency_ms"}
    if not required.issubset(frame.columns):
        raise ValueError(f"CSV must have columns: {', '.join(sorted(required))}")
    for column in ("hold_ms", "flight_ms", "latency_ms"): frame[column] = pd.to_numeric(frame[column], errors="coerce")
    frame["timestamp"] = pd.to_datetime(frame["date"].astype(str) + " " + frame["time"].astype(str), errors="coerce")
    return frame.dropna(subset=["user_id", "timestamp"])


def predict(csv_path: str | Path, config_path: str | Path | None = None) -> list[dict[str, float | str | int]]:
    """Return risk predictions for every participant represented in a CSV."""
    config = load_config(config_path); paths = ensure_runtime_directories(config)
    bundle = joblib.load(paths.checkpoints_dir / config["tappy"]["checkpoint_name"])
    features, users = extract_user_features(_read_events(Path(csv_path))); ordered = features.reindex(columns=bundle["feature_names"])
    probabilities = bundle["model"].predict_proba(bundle["preprocessor"].transform(ordered))[:, 1]
    return [{"user_id": user, "predicted_class": "parkinson_risk" if probability >= .5 else "lower_risk", "probability": float(probability), "confidence": float(max(probability, 1 - probability))} for user, probability in zip(users.tolist(), probabilities.tolist(), strict=True)]


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Predict Tappy/finger timing screening risk."); parser.add_argument("--csv", required=True, type=Path); parser.add_argument("--config", type=Path)
    args = parser.parse_args(); print(predict(args.csv, args.config))
