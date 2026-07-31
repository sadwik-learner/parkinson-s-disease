from __future__ import annotations

from dataclasses import dataclass
from io import TextIOWrapper
from pathlib import Path
from zipfile import ZipFile

import pandas as pd


@dataclass(frozen=True)
class TappyDataset:
    events: pd.DataFrame
    users: pd.DataFrame


def _find_zip(directory: Path, contains: str) -> Path:
    matches = sorted(directory.glob(f"*{contains}*.zip"))
    if not matches:
        raise FileNotFoundError(f"Could not find a {contains} zip file in {directory}.")
    return matches[0]


def _read_user_records(users_zip: Path) -> pd.DataFrame:
    records: list[dict[str, object]] = []
    with ZipFile(users_zip) as archive:
        for name in archive.namelist():
            if name.endswith("/") or not name.lower().endswith(".txt"):
                continue
            user_id = Path(name).stem.removeprefix("User_")
            values: dict[str, str] = {}
            with archive.open(name) as binary_file:
                for line in TextIOWrapper(binary_file, encoding="utf-8", errors="replace"):
                    if ":" in line:
                        key, value = line.strip().split(":", 1)
                        values[key.strip()] = value.strip()
            status = values.get("Parkinsons", "").casefold()
            if status not in {"true", "false"}:
                continue
            records.append({"user_id": user_id, "label": int(status == "true"), "birth_year": pd.to_numeric(values.get("BirthYear"), errors="coerce"), "gender": values.get("Gender", "Unknown")})
    users = pd.DataFrame(records)
    if users.empty or users["label"].nunique() != 2:
        raise ValueError("Tappy users metadata does not include both Parkinson's classes.")
    return users


def _read_events(data_zip: Path) -> pd.DataFrame:
    columns = ["user_id", "date", "time", "key", "hold_ms", "direction", "flight_ms", "latency_ms"]
    frames: list[pd.DataFrame] = []
    with ZipFile(data_zip) as archive:
        for name in archive.namelist():
            if name.endswith("/") or not name.lower().endswith(".txt"):
                continue
            with archive.open(name) as file:
                frame = pd.read_csv(
                    file,
                    sep="\t",
                    header=None,
                    names=columns,
                    dtype={"user_id": "string", "key": "string", "direction": "string", "date": "string", "time": "string", "hold_ms": "string", "flight_ms": "string", "latency_ms": "string"},
                )
            frames.append(frame)
    if not frames:
        raise ValueError("No Tappy event files were found.")
    events = pd.concat(frames, ignore_index=True)
    for column in ["hold_ms", "flight_ms", "latency_ms"]:
        events[column] = pd.to_numeric(events[column], errors="coerce")
    events["timestamp"] = pd.to_datetime(events["date"].astype(str) + " " + events["time"].astype(str), format="%y%m%d %H:%M:%S.%f", errors="coerce")
    return events.dropna(subset=["user_id", "timestamp"]).reset_index(drop=True)


def load_tappy_dataset(directory: str | Path) -> TappyDataset:
    """Load archived Tappy files directly from their supplied zip archives."""
    directory = Path(directory)
    return TappyDataset(events=_read_events(_find_zip(directory, "Data")), users=_read_user_records(_find_zip(directory, "users")))
