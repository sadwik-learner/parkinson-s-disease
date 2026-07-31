"""Classification evaluation and plotting for image-based modalities."""

from __future__ import annotations

from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import torch
from sklearn.metrics import (accuracy_score, average_precision_score, classification_report,
                             confusion_matrix, f1_score, precision_recall_curve,
                             precision_score, recall_score, roc_auc_score, roc_curve)

from ml.spiral.utils import write_json


def _plot_curves(labels: np.ndarray, probabilities: np.ndarray, output_dir: Path, prefix: str) -> None:
    figure, axes = plt.subplots(1, 3, figsize=(15, 4))
    matrix = confusion_matrix(labels, probabilities >= 0.5)
    axes[0].imshow(matrix, cmap="Blues")
    axes[0].set(title="Confusion matrix", xlabel="Predicted", ylabel="Actual", xticks=[0, 1], yticks=[0, 1])
    for row, values in enumerate(matrix):
        for column, value in enumerate(values):
            axes[0].text(column, row, str(value), ha="center", va="center")
    false_positive_rate, true_positive_rate, _ = roc_curve(labels, probabilities)
    axes[1].plot(false_positive_rate, true_positive_rate, label=f"AUC={roc_auc_score(labels, probabilities):.3f}")
    axes[1].plot([0, 1], [0, 1], "--", color="grey")
    axes[1].set(title="ROC curve", xlabel="False positive rate", ylabel="True positive rate")
    axes[1].legend()
    precision, recall, _ = precision_recall_curve(labels, probabilities)
    axes[2].plot(recall, precision)
    axes[2].set(title="Precision-recall curve", xlabel="Recall", ylabel="Precision")
    figure.tight_layout()
    figure.savefig(output_dir / f"{prefix}_evaluation.png", dpi=160)
    plt.close(figure)


def plot_history(history: dict[str, list[float]], output_dir: Path) -> None:
    """Save epoch-level train and validation loss curves."""
    output_dir.mkdir(parents=True, exist_ok=True)
    figure, axis = plt.subplots(figsize=(7, 4))
    axis.plot(history["train_loss"], label="train")
    axis.plot(history["validation_loss"], label="validation")
    axis.set(xlabel="Epoch", ylabel="BCE loss", title="Training history")
    axis.legend()
    figure.tight_layout()
    figure.savefig(output_dir / "training_loss.png", dpi=160)
    plt.close(figure)


def evaluate_model(model: torch.nn.Module, loader: object, device: torch.device, output_dir: Path, prefix: str = "test") -> dict[str, object]:
    """Evaluate a one-logit PyTorch classifier and persist metrics/plots."""
    model.eval()
    labels, probabilities = [], []
    with torch.no_grad():
        for images, targets in loader:
            logits = model(images.to(device)).squeeze(1)
            probabilities.extend(torch.sigmoid(logits).cpu().tolist())
            labels.extend(targets.tolist())
    y_true, y_prob = np.asarray(labels, dtype=int), np.asarray(probabilities, dtype=float)
    predictions = (y_prob >= 0.5).astype(int)
    sensitivity = recall_score(y_true, predictions, zero_division=0)
    matrix = confusion_matrix(y_true, predictions)
    specificity = float(matrix[0, 0] / matrix[0].sum()) if matrix.shape == (2, 2) and matrix[0].sum() else 0.0
    metrics: dict[str, object] = {
        "accuracy": float(accuracy_score(y_true, predictions)), "precision": float(precision_score(y_true, predictions, zero_division=0)),
        "recall": float(sensitivity), "sensitivity": float(sensitivity), "specificity": specificity,
        "f1": float(f1_score(y_true, predictions, zero_division=0)), "roc_auc": float(roc_auc_score(y_true, y_prob)),
        "average_precision": float(average_precision_score(y_true, y_prob)), "confusion_matrix": matrix.tolist(),
        "classification_report": classification_report(y_true, predictions, output_dict=True, zero_division=0),
    }
    output_dir.mkdir(parents=True, exist_ok=True)
    _plot_curves(y_true, y_prob, output_dir, prefix)
    write_json(output_dir / f"{prefix}_metrics.json", metrics)
    return metrics
