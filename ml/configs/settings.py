"""Configuration loading and project-path utilities."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_CONFIG_PATH = Path(__file__).with_name("config.yaml")


@dataclass(frozen=True)
class ProjectPaths:
    datasets_dir: Path
    checkpoints_dir: Path
    outputs_dir: Path
    logs_dir: Path


def _resolve_path(value: str) -> Path:
    path = Path(value)
    return path if path.is_absolute() else PROJECT_ROOT / path


def load_config(path: str | Path | None = None) -> dict[str, Any]:
    """Read a YAML configuration file and resolve project-relative paths."""
    config_path = Path(path) if path else DEFAULT_CONFIG_PATH
    if not config_path.is_absolute():
        config_path = PROJECT_ROOT / config_path
    if not config_path.is_file():
        raise FileNotFoundError(f"Configuration file not found: {config_path}")
    with config_path.open("r", encoding="utf-8") as stream:
        config = yaml.safe_load(stream)
    if not isinstance(config, dict):
        raise ValueError("Configuration must be a YAML mapping.")
    return config


def get_paths(config: dict[str, Any]) -> ProjectPaths:
    """Return absolute runtime directories configured for this project."""
    paths = config["paths"]
    return ProjectPaths(
        datasets_dir=_resolve_path(paths["datasets_dir"]),
        checkpoints_dir=_resolve_path(paths["checkpoints_dir"]),
        outputs_dir=_resolve_path(paths["outputs_dir"]),
        logs_dir=_resolve_path(paths["logs_dir"]),
    )


def ensure_runtime_directories(config: dict[str, Any]) -> ProjectPaths:
    """Create only generated-artifact directories and return their paths."""
    paths = get_paths(config)
    for directory in (paths.checkpoints_dir, paths.outputs_dir, paths.logs_dir):
        directory.mkdir(parents=True, exist_ok=True)
    return paths
