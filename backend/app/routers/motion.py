from __future__ import annotations

from fastapi import APIRouter

from app.schemas.motion import MotionPayload

router = APIRouter(prefix="/motion", tags=["motion"])


@router.post("")
async def upload_motion(payload: MotionPayload) -> dict[str, str]:
    """Accept motion tracking data.

    Motion feature extraction and prediction scoring will be wired in later.
    """
    _ = payload
    return {"status": "success", "module": "motion"}

