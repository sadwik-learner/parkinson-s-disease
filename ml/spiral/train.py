"""EfficientNet-B0 transfer-learning training entrypoint."""

from __future__ import annotations

import argparse
from pathlib import Path

import torch
from torch import nn
from torch.optim import AdamW
from torch.optim.lr_scheduler import ReduceLROnPlateau
from torch.utils.data import DataLoader

from ml.configs.datasets import resolve_spiral_images_dir
from ml.configs.settings import ensure_runtime_directories, load_config
from ml.spiral.dataset import SpiralImageDataset, discover_spiral_records, split_records
from ml.spiral.evaluate import evaluate_model, plot_history
from ml.spiral.model import build_model, set_feature_extractor_trainable
from ml.spiral.preprocess import evaluation_transform, training_transform
from ml.spiral.utils import choose_device, configure_logger, set_seed, write_json


def _epoch(model: nn.Module, loader: DataLoader, criterion: nn.Module, optimizer: AdamW | None, device: torch.device, scaler: torch.amp.GradScaler) -> float:
    training = optimizer is not None
    model.train(training)
    total_loss, count = 0.0, 0
    for images, labels in loader:
        images, labels = images.to(device), labels.to(device, dtype=torch.float32)
        if training:
            optimizer.zero_grad(set_to_none=True)
        with torch.amp.autocast(device_type=device.type, enabled=device.type == "cuda"):
            logits = model(images).squeeze(1)
            loss = criterion(logits, labels)
        if training:
            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()
        total_loss += loss.item() * labels.size(0)
        count += labels.size(0)
    return total_loss / max(count, 1)


def train(config_path: str | Path | None = None, resume: str | Path | None = None) -> dict[str, object]:
    """Train and evaluate the spiral model, persisting the best validation checkpoint."""
    config = load_config(config_path)
    paths = ensure_runtime_directories(config)
    settings = config["spiral"]
    set_seed(int(config["runtime"]["seed"]))
    logger = configure_logger("spiral.train", paths.logs_dir / "spiral_train.log")
    images_dir = resolve_spiral_images_dir(config)
    labels_csv = config["paths"].get("spiral_labels_csv")
    records = discover_spiral_records(images_dir, labels_csv)
    train_records, validation_records, test_records = split_records(records, settings["validation_fraction"], settings["test_fraction"], int(config["runtime"]["seed"]))
    train_loader = DataLoader(SpiralImageDataset(train_records, training_transform(settings["image_size"], settings["horizontal_flip"])), batch_size=settings["batch_size"], shuffle=True, num_workers=config["runtime"]["num_workers"], pin_memory=True)
    evaluation = evaluation_transform(settings["image_size"])
    validation_loader = DataLoader(SpiralImageDataset(validation_records, evaluation), batch_size=settings["batch_size"], num_workers=config["runtime"]["num_workers"])
    test_loader = DataLoader(SpiralImageDataset(test_records, evaluation), batch_size=settings["batch_size"], num_workers=config["runtime"]["num_workers"])
    device = choose_device(config["runtime"]["device"])
    model = build_model(settings["pretrained"]).to(device)
    set_feature_extractor_trainable(model, False)
    criterion = nn.BCEWithLogitsLoss()
    optimizer = AdamW(filter(lambda parameter: parameter.requires_grad, model.parameters()), lr=settings["learning_rate"], weight_decay=settings["weight_decay"])
    scheduler = ReduceLROnPlateau(optimizer, mode="min", factor=0.3, patience=2)
    scaler = torch.amp.GradScaler(device.type, enabled=device.type == "cuda")
    checkpoint = paths.checkpoints_dir / settings["checkpoint_name"]
    start_epoch, best_loss, stale, history = 0, float("inf"), 0, {"train_loss": [], "validation_loss": []}
    if resume:
        state = torch.load(resume, map_location=device, weights_only=False)
        model.load_state_dict(state["model_state"])
        if state["epoch"] >= int(settings["epochs"]):
            set_feature_extractor_trainable(model, True)
            optimizer = AdamW(model.parameters(), lr=settings["fine_tune_learning_rate"], weight_decay=settings["weight_decay"])
        optimizer.load_state_dict(state["optimizer_state"])
        start_epoch, best_loss, history = state["epoch"] + 1, state["best_validation_loss"], state["history"]
    total_epochs = int(settings["epochs"]) + int(settings["fine_tune_epochs"])
    for epoch in range(start_epoch, total_epochs):
        if epoch == int(settings["epochs"]):
            set_feature_extractor_trainable(model, True)
            optimizer = AdamW(model.parameters(), lr=settings["fine_tune_learning_rate"], weight_decay=settings["weight_decay"])
            scheduler = ReduceLROnPlateau(optimizer, mode="min", factor=0.3, patience=2)
        train_loss = _epoch(model, train_loader, criterion, optimizer, device, scaler)
        validation_loss = _epoch(model, validation_loader, criterion, None, device, scaler)
        history["train_loss"].append(train_loss); history["validation_loss"].append(validation_loss)
        scheduler.step(validation_loss)
        logger.info("epoch=%d train_loss=%.5f validation_loss=%.5f", epoch + 1, train_loss, validation_loss)
        if validation_loss < best_loss:
            best_loss, stale = validation_loss, 0
            torch.save({"model_state": model.state_dict(), "optimizer_state": optimizer.state_dict(), "epoch": epoch, "best_validation_loss": best_loss, "history": history, "config": config}, checkpoint)
        else:
            stale += 1
            if stale >= int(settings["early_stopping_patience"]):
                logger.info("Early stopping at epoch %d", epoch + 1); break
    state = torch.load(checkpoint, map_location=device, weights_only=False)
    model.load_state_dict(state["model_state"])
    output_dir = paths.outputs_dir / "spiral"
    plot_history(history, output_dir)
    metrics = evaluate_model(model, test_loader, device, output_dir)
    summary = {"checkpoint": str(checkpoint), "best_validation_loss": best_loss, "test": metrics}
    write_json(output_dir / "summary.json", summary)
    return summary


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train the spiral EfficientNet-B0 model.")
    parser.add_argument("--config", type=Path); parser.add_argument("--resume", type=Path)
    args = parser.parse_args()
    print(train(args.config, args.resume))
