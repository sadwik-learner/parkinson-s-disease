from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.config import SPIRAL_UPLOAD_DIR
from app.utils.file_utils import save_upload_file

router = APIRouter(prefix="/spiral", tags=["spiral"])


@router.post("")
async def upload_spiral(file: UploadFile = File(...)) -> dict[str, str]:
    """Store the uploaded spiral drawing image.

    Image preprocessing and model inference will be added here later.
    """
    try:
        filename = await save_upload_file(file, SPIRAL_UPLOAD_DIR)
        return {"status": "success", "module": "spiral", "filename": filename}
    except OSError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save uploaded spiral file.",
        ) from exc

