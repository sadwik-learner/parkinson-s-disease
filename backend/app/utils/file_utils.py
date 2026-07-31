from __future__ import annotations

import re
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile


_SAFE_CHARS_PATTERN = re.compile(r"[^a-zA-Z0-9._-]+")


def ensure_directory(path: Path) -> Path:
    """Create a directory if it does not exist and return it."""
    path.mkdir(parents=True, exist_ok=True)
    return path


def sanitize_filename(filename: str) -> str:
    """Return a filesystem-safe filename."""
    stem = Path(filename).stem or "upload"
    suffix = Path(filename).suffix
    safe_stem = _SAFE_CHARS_PATTERN.sub("-", stem).strip("-.") or "upload"
    unique_prefix = uuid4().hex
    return f"{unique_prefix}-{safe_stem}{suffix}"


async def save_upload_file(upload_file: UploadFile, destination_dir: Path) -> str:
    """Persist an uploaded file to disk and return the stored filename."""
    ensure_directory(destination_dir)
    safe_name = sanitize_filename(upload_file.filename or "upload")
    destination_path = destination_dir / safe_name

    try:
        with destination_path.open("wb") as destination_file:
            while True:
                chunk = await upload_file.read(1024 * 1024)
                if not chunk:
                    break
                destination_file.write(chunk)
    finally:
        await upload_file.close()

    return safe_name


def ensure_upload_directories(*directories: Path) -> None:
    """Create all upload directories needed by the application."""
    for directory in directories:
        ensure_directory(directory)
