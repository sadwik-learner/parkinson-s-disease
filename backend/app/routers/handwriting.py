from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.config import HANDWRITING_UPLOAD_DIR
from app.utils.file_utils import save_upload_file

router = APIRouter(prefix="/handwriting", tags=["handwriting"])


@router.post("")
async def upload_handwriting(file: UploadFile = File(...)) -> dict[str, str]:
    """Store the uploaded handwriting sample image.

    OCR and handwriting feature extraction will be integrated later.
    """
    try:
        filename = await save_upload_file(file, HANDWRITING_UPLOAD_DIR)
        return {"status": "success", "module": "handwriting", "filename": filename}
    except OSError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save uploaded handwriting file.",
        ) from exc

