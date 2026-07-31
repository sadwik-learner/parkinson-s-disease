"""XGBoost model definition and search-space configuration."""

from __future__ import annotations

from xgboost import XGBClassifier


def build_model(seed: int) -> XGBClassifier:
    """Create an XGBoost binary classifier suitable for randomized search."""
    return XGBClassifier(eval_metric="logloss", random_state=seed, n_jobs=-1, tree_method="hist")


def search_space() -> dict[str, list[object]]:
    """Return bounded XGBoost hyperparameters for small clinical-style datasets."""
    return {"n_estimators": [100, 200, 350, 500], "max_depth": [2, 3, 4, 5], "learning_rate": [0.01, 0.03, 0.05, 0.1], "subsample": [0.7, 0.85, 1.0], "colsample_bytree": [0.7, 0.85, 1.0], "min_child_weight": [1, 3, 5], "reg_lambda": [1.0, 3.0, 7.0]}
