"""Dataset discovery and KaggleHub-backed acquisition helpers."""

from __future__ import annotations

from pathlib import Path
from typing import Any


IMAGE_SUFFIXES = {".bmp", ".jpeg", ".jpg", ".png", ".tif", ".tiff"}


def _project_path(value: str | None) -> Path | None:
    if not value:
        return None
    candidate = Path(value)
    return candidate if candidate.is_absolute() else Path.cwd() / candidate


def _image_count(path: Path) -> int:
    return sum(1 for item in path.rglob("*") if item.is_file() and item.suffix.casefold() in IMAGE_SUFFIXES)


def resolve_spiral_images_dir(config: dict[str, Any]) -> Path:
    """Use a configured local image tree or download the configured Kaggle dataset.

    The returned root is intentionally the dataset root: the spiral loader searches
    it recursively, accommodating the directory layout provided by Kaggle.
    """
    configured = _project_path(config["paths"].get("spiral_images_dir"))
    if configured and configured.is_dir() and _image_count(configured) > 0:
        return configured
    try:
        import kagglehub
    except ImportError as error:
        raise RuntimeError("kagglehub is required to acquire the missing spiral image dataset.") from error
    dataset_id = config["spiral"]["dataset_id"]
    downloaded = Path(kagglehub.dataset_download(dataset_id))
    if not downloaded.is_dir() or _image_count(downloaded) == 0:
        raise FileNotFoundError(f"Kaggle dataset {dataset_id!r} was downloaded but contains no supported images: {downloaded}")
    return downloaded


def resolve_tappy_dir(config: dict[str, Any]) -> Path:
    """Recursively locate the existing Tappy archive directory without downloading it."""
    configured = _project_path(config["paths"].get("tappy_dir"))
    datasets_dir = _project_path(config["paths"].get("datasets_dir"))
    roots = [path for path in (configured, datasets_dir) if path and path.is_dir()]
    for root in roots:
        data_archives = list(root.rglob("*Data*.zip"))
        user_archives = list(root.rglob("*users*.zip"))
        if data_archives and user_archives:
            return data_archives[0].parent
    raise FileNotFoundError("Existing Tappy archives were not found under the configured datasets directory.")


import kagglehub

# Download latest version
path = kagglehub.dataset_download("banilkumar20phd7071/handwritten-parkinsons-disease-augmented-data")