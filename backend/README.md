# Parkinson AI Backend

FastAPI backend for the Parkinson's Disease AI Screening System.

## Run

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API

- `GET /` -> backend health message
- `POST /api/spiral` -> upload spiral drawing
- `POST /api/handwriting` -> upload handwriting sample
- `POST /api/motion` -> submit motion tracking payload
- `POST /api/predict` -> return placeholder prediction

## Notes

- Upload folders are created automatically on startup.
- ML inference hooks are intentionally left as placeholders for future integration.
