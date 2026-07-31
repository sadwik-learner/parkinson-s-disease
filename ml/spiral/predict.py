"""Single-image spiral risk inference."""

from __future__ import annotations

import argparse
from pathlib import Path

import torch
from PIL import Image

from ml.configs.settings import ensure_runtime_directories, load_config
from ml.spiral.model import build_model
from ml.spiral.preprocess import evaluation_transform
from ml.spiral.utils import choose_device


def predict(image_path: str | Path, config_path: str | Path | None = None) -> dict[str, float | int | str]:
    """Return a class, calibrated-style probability, and threshold confidence."""
    config = load_config(config_path); paths = ensure_runtime_directories(config); settings = config["spiral"]
    image_path = Path(image_path)
    if not image_path.is_file(): raise FileNotFoundError(f"Image not found: {image_path}")
    device = choose_device(config["runtime"]["device"])
    checkpoint = torch.load(paths.checkpoints_dir / settings["checkpoint_name"], map_location=device, weights_only=False)
    model = build_model(pretrained=False).to(device); model.load_state_dict(checkpoint["model_state"]); model.eval()
    with Image.open(image_path) as image, torch.no_grad():
        tensor = evaluation_transform(settings["image_size"])(image.convert("RGB")).unsqueeze(0).to(device)
        probability = float(torch.sigmoid(model(tensor).squeeze()).item())
    predicted = int(probability >= 0.5)
    return {"predicted_class": "parkinson_risk" if predicted else "lower_risk", "class_id": predicted, "probability": probability, "confidence": max(probability, 1 - probability)}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Predict spiral-image Parkinson's screening risk.")
    parser.add_argument("--image", required=True, type=Path); parser.add_argument("--config", type=Path)
    print(predict(parser.parse_args().image, parser.parse_args().config))
