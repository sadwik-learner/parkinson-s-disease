from __future__ import annotations

import numpy as np
import pandas as pd


NUMERIC_EVENT_COLUMNS = ("hold_ms", "flight_ms", "latency_ms")


def extract_user_features(events: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series]:
    """Aggregate raw key events into one feature vector per participant."""
    event_copy = events.copy()
    event_copy["day"] = event_copy["timestamp"].dt.date
    groups = event_copy.groupby("user_id", observed=True)
    rows: list[dict[str, float | str]] = []
    quantiles = (0.10, 0.25, 0.50, 0.75, 0.90)
    for user_id, frame in groups:
        row: dict[str, float | str] = {"user_id": str(user_id), "event_count": float(len(frame)), "active_days": float(frame["day"].nunique()), "unique_keys": float(frame["key"].nunique()), "direction_diversity": float(frame["direction"].nunique())}
        for column in NUMERIC_EVENT_COLUMNS:
            values = frame[column].dropna()
            row[f"{column}_missing_rate"] = float(frame[column].isna().mean())
            if values.empty:
                for stat in ("mean", "std", "min", "max"):
                    row[f"{column}_{stat}"] = np.nan
                for quantile in quantiles:
                    row[f"{column}_q{int(quantile * 100):02d}"] = np.nan
            else:
                row.update({f"{column}_mean": float(values.mean()), f"{column}_std": float(values.std(ddof=0)), f"{column}_min": float(values.min()), f"{column}_max": float(values.max())})
                row.update({f"{column}_q{int(quantile * 100):02d}": float(values.quantile(quantile)) for quantile in quantiles})
        rows.append(row)
    feature_frame = pd.DataFrame(rows)
    user_ids = feature_frame.pop("user_id").astype(str)
    return feature_frame, user_ids


def build_user_features(events: pd.DataFrame, users: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series, pd.Series]:
    """Return participant features, known labels, and participant IDs for training."""
    feature_frame, user_ids = extract_user_features(events)
    merged = users[["user_id", "label"]].merge(
        pd.concat([user_ids.rename("user_id"), feature_frame], axis=1), on="user_id", how="inner", validate="one_to_one"
    )
    if merged["label"].nunique() != 2:
        raise ValueError("Feature creation yielded fewer than two Tappy classes.")
    labels = merged.pop("label").astype(int)
    groups_out = merged.pop("user_id").astype(str)
    return merged, labels, groups_out
