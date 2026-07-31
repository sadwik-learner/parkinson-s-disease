"""Evaluation helpers for the Tappy/finger-tap tabular classifier."""

from __future__ import annotations

from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from sklearn.metrics import (accuracy_score, confusion_matrix, f1_score, precision_recall_curve,
                             precision_score, recall_score, roc_auc_score, roc_curve)

from ml.spiral.utils import write_json


def evaluate_classifier(model: object, features: np.ndarray, labels: object, output_dir: Path) -> dict[str, object]:
    """Generate classification metrics, confusion matrix, ROC and PR plots."""
    y_true = np.asarray(labels, dtype=int); probabilities = model.predict_proba(features)[:, 1]
    predicted = (probabilities >= 0.5).astype(int); matrix = confusion_matrix(y_true, predicted)
    sensitivity = recall_score(y_true, predicted, zero_division=0)
    metrics: dict[str, object] = {"accuracy": float(accuracy_score(y_true, predicted)), "precision": float(precision_score(y_true, predicted, zero_division=0)), "recall": float(sensitivity), "sensitivity": float(sensitivity), "specificity": float(matrix[0, 0] / matrix[0].sum()) if matrix[0].sum() else 0.0, "f1": float(f1_score(y_true, predicted, zero_division=0)), "roc_auc": float(roc_auc_score(y_true, probabilities)), "confusion_matrix": matrix.tolist()}
    output_dir.mkdir(parents=True, exist_ok=True); write_json(output_dir / "test_metrics.json", metrics)
    figure, axes = plt.subplots(1, 3, figsize=(15, 4))
    axes[0].imshow(matrix, cmap="Blues"); axes[0].set(title="Confusion matrix", xlabel="Predicted", ylabel="Actual", xticks=[0, 1], yticks=[0, 1])
    for row, values in enumerate(matrix):
        for column, value in enumerate(values): axes[0].text(column, row, str(value), ha="center", va="center")
    fpr, tpr, _ = roc_curve(y_true, probabilities); axes[1].plot(fpr, tpr); axes[1].plot([0, 1], [0, 1], "--", color="gray"); axes[1].set(title="ROC curve", xlabel="False positive rate", ylabel="True positive rate")
    precision, recall, _ = precision_recall_curve(y_true, probabilities); axes[2].plot(recall, precision); axes[2].set(title="Precision-recall curve", xlabel="Recall", ylabel="Precision")
    figure.tight_layout(); figure.savefig(output_dir / "evaluation.png", dpi=160); plt.close(figure)
    return metrics
