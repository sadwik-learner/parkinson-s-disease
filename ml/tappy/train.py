"""Tappy keystroke/finger-timing XGBoost training entrypoint."""

from __future__ import annotations

import argparse
from pathlib import Path

import joblib
from sklearn.model_selection import RandomizedSearchCV, train_test_split

from ml.configs.datasets import resolve_tappy_dir
from ml.configs.settings import ensure_runtime_directories, load_config
from ml.spiral.utils import configure_logger, set_seed, write_json
from ml.tappy.dataset import load_tappy_dataset
from ml.tappy.evaluate import evaluate_classifier
from ml.tappy.feature_engineering import build_user_features
from ml.tappy.model import build_model, search_space
from ml.tappy.preprocess import build_preprocessor, validate_feature_frame


def train(config_path: str | Path | None = None) -> dict[str, object]:
    """Tune and train an XGBoost participant-level keystroke risk model."""
    config = load_config(config_path); paths = ensure_runtime_directories(config); settings = config["tappy"]
    set_seed(int(config["runtime"]["seed"])); logger = configure_logger("tappy.train", paths.logs_dir / "tappy_train.log")
    data_dir = resolve_tappy_dir(config)
    data = load_tappy_dataset(data_dir)
    features, labels, users = build_user_features(data.events, data.users); validate_feature_frame(features)
    x_train, x_test, y_train, y_test, _, _ = train_test_split(features, labels, users, test_size=settings["test_fraction"], stratify=labels, random_state=config["runtime"]["seed"])
    preprocessor = build_preprocessor().fit(x_train)
    smallest_training_class = int(y_train.value_counts().min())
    cv_folds = min(int(settings["cv_folds"]), smallest_training_class)
    if cv_folds < 2:
        raise ValueError("Tappy training split leaves fewer than two examples in a class; reduce test_fraction or add participants.")
    search = RandomizedSearchCV(build_model(int(config["runtime"]["seed"])), search_space(), n_iter=settings["search_iterations"], scoring="roc_auc", cv=cv_folds, random_state=config["runtime"]["seed"], n_jobs=-1, refit=True, verbose=1)
    search.fit(preprocessor.transform(x_train), y_train)
    logger.info("Best CV ROC AUC: %.4f; params=%s", search.best_score_, search.best_params_)
    output_dir = paths.outputs_dir / "tappy"; metrics = evaluate_classifier(search.best_estimator_, preprocessor.transform(x_test), y_test, output_dir)
    checkpoint = paths.checkpoints_dir / settings["checkpoint_name"]
    joblib.dump({"model": search.best_estimator_, "preprocessor": preprocessor, "feature_names": list(features.columns), "best_params": search.best_params_, "best_cv_roc_auc": float(search.best_score_)}, checkpoint)
    summary = {"checkpoint": str(checkpoint), "participants": int(len(features)), "best_cv_roc_auc": float(search.best_score_), "test": metrics}
    write_json(output_dir / "summary.json", summary); return summary


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train the Tappy/finger timing XGBoost model."); parser.add_argument("--config", type=Path)
    args = parser.parse_args(); print(train(args.config))
