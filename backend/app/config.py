from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
UPLOADS_DIR = BASE_DIR / "uploads"
SPIRAL_UPLOAD_DIR = UPLOADS_DIR / "spiral"
HANDWRITING_UPLOAD_DIR = UPLOADS_DIR / "handwriting"
PREDICTION_UPLOAD_DIR = UPLOADS_DIR / "prediction-tmp"

ALLOWED_ORIGINS = [
    "http://localhost:5173",
]

API_PREFIX = "/api"
API_TITLE = "Parkinson AI Backend"
API_VERSION = "1.0.0"
REQUEST_TIMEOUT_SECONDS = 30
