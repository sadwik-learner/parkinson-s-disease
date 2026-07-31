"""Image dataset discovery and split utilities for spiral drawings."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import pandas as pd
import cv2
import numpy as np
from PIL import Image
from sklearn.model_selection import train_test_split
from torch.utils.data import Dataset


IMAGE_SUFFIXES = {".bmp", ".jpeg", ".jpg", ".png", ".tif", ".tiff"}
POSITIVE_LABELS = {"1", "case", "parkinson", "parkinsons", "pd", "positive"}
NEGATIVE_LABELS = {"0", "control", "healthy", "negative", "nonparkinson", "nonparkinsons"}


@dataclass(frozen=True)
class SpiralRecord:
    image_path: Path
    label: int


class SpiralImageDataset(Dataset[tuple[object, int]]):
    """PIL-backed, binary-labelled spiral image dataset."""

    def __init__(self, records: list[SpiralRecord], transform: object) -> None:
        if not records:
            raise ValueError("Spiral image dataset cannot be empty.")
        self.records = records
        self.transform = transform

    def __len__(self) -> int:
        return len(self.records)

    def __getitem__(self, index: int) -> tuple[object, int]:
        record = self.records[index]
        try:
            if record.image_path.suffix.casefold() == ".txt":
                result = self.transform(_render_trace(record.image_path))
            else:
                with Image.open(record.image_path) as image:
                    result = self.transform(image.convert("RGB"))
        except (OSError, ValueError) as error:
            raise RuntimeError(f"Cannot read spiral image: {record.image_path}") from error
        return result, record.label


def _render_trace(trace_path: Path, canvas_size: int = 512) -> Image.Image:
    """Rasterize a labelled Kaggle drawing trace into an RGB spiral image."""
    data = pd.read_csv(trace_path, sep=";", header=None, usecols=[0, 1, 6], names=["x", "y", "test_id"])
    data = data.apply(pd.to_numeric, errors="coerce").dropna()
    spiral = data[data["test_id"] == 0]
    points = spiral[["x", "y"]].to_numpy(dtype=np.float32)
    if len(points) < 2:
        points = data[["x", "y"]].to_numpy(dtype=np.float32)
    if len(points) < 2:
        raise ValueError(f"Trace has insufficient coordinate points: {trace_path}")
    minimum, maximum = points.min(axis=0), points.max(axis=0)
    scale = float(np.max(maximum - minimum))
    if scale <= 0:
        raise ValueError(f"Trace has no coordinate variation: {trace_path}")
    normalized = (points - minimum) / scale
    margin = 16
    pixels = (normalized * (canvas_size - 2 * margin) + margin).round().astype(np.int32)
    canvas = np.full((canvas_size, canvas_size, 3), 255, dtype=np.uint8)
    cv2.polylines(canvas, [pixels.reshape(-1, 1, 2)], False, (0, 0, 0), thickness=2, lineType=cv2.LINE_AA)
    return Image.fromarray(cv2.cvtColor(canvas, cv2.COLOR_BGR2RGB))


def _normalise_label(value: object) -> int:
    normalized = str(value).strip().casefold().replace("'", "")
    if normalized in POSITIVE_LABELS:
        return 1
    if normalized in NEGATIVE_LABELS:
        return 0
    raise ValueError(f"Unsupported spiral label {value!r}; use a Parkinson/control or 1/0 label.")


def _records_from_csv(images_dir: Path, labels_csv: Path) -> list[SpiralRecord]:
    frame = pd.read_csv(labels_csv)
    path_column = next((column for column in ("image_path", "path", "image", "filename", "file") if column in frame.columns), None)
    label_column = next((column for column in ("label", "class", "target", "diagnosis") if column in frame.columns), None)
    if path_column is None or label_column is None:
        raise ValueError("Spiral label CSV needs image_path (or filename) and label (or class) columns.")
    records = []
    for row in frame[[path_column, label_column]].dropna().itertuples(index=False):
        candidate = Path(str(row[0]))
        image_path = candidate if candidate.is_absolute() else images_dir / candidate
        if not image_path.is_file():
            raise FileNotFoundError(f"Spiral image named in label CSV does not exist: {image_path}")
        records.append(SpiralRecord(image_path=image_path, label=_normalise_label(row[1])))
    return records


def _records_from_class_directories(images_dir: Path) -> list[SpiralRecord]:
    def infer_label(image_path: Path) -> int:
        """Infer labels from class folders or the dataset's c*/d* drawing names."""
        try:
            return _normalise_label(image_path.parent.name)
        except ValueError:
            pass
        stem = image_path.stem.casefold()
        if stem.startswith("c"):
            return 0
        if stem.startswith("d"):
            return 1
        raise ValueError(f"Cannot infer a label for spiral image: {image_path}")

    records: list[SpiralRecord] = []
    for image_path in images_dir.rglob("*"):
        if not image_path.is_file() or image_path.name.startswith("._"):
            continue
        if image_path.suffix.casefold() in IMAGE_SUFFIXES:
            try:
                records.append(SpiralRecord(image_path=image_path, label=infer_label(image_path)))
            except ValueError:
                continue
        elif image_path.suffix.casefold() == ".txt" and image_path.stem.upper().startswith(("C_", "P_")):
            records.append(SpiralRecord(image_path=image_path, label=int(image_path.stem.upper().startswith("P_"))))
    return records


def discover_spiral_records(images_dir: str | Path, labels_csv: str | Path | None = None) -> list[SpiralRecord]:
    """Find labelled images from a manifest or class-named directory tree.

    Directory mode expects `control/` and `parkinson/` (or recognised aliases)
    below the configured images directory. Manifest mode permits arbitrary layout.
    """
    images_directory = Path(images_dir)
    if not images_directory.is_dir():
        raise FileNotFoundError(
            f"Spiral image directory not found: {images_directory}. The local Spiral_HandPD.csv contains descriptors, not images."
        )
    records = _records_from_csv(images_directory, Path(labels_csv)) if labels_csv else _records_from_class_directories(images_directory)
    counts = pd.Series([record.label for record in records]).value_counts()
    if len(records) < 6 or set(counts.index) != {0, 1}:
        raise ValueError("Need at least six readable spiral images spanning both binary classes.")
    return records


def split_records(records: list[SpiralRecord], validation_fraction: float, test_fraction: float, seed: int) -> tuple[list[SpiralRecord], list[SpiralRecord], list[SpiralRecord]]:
    """Create stratified train/validation/test record lists."""
    if not 0 < validation_fraction < 1 or not 0 < test_fraction < 1 or validation_fraction + test_fraction >= 1:
        raise ValueError("Validation and test fractions must be positive and sum to less than one.")
    labels = [record.label for record in records]
    train_val, test = train_test_split(records, test_size=test_fraction, stratify=labels, random_state=seed)
    validation_relative = validation_fraction / (1 - test_fraction)
    train, validation = train_test_split(train_val, test_size=validation_relative, stratify=[record.label for record in train_val], random_state=seed)
    return train, validation, test
