from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.enhanced_mock_vton import generate_enhanced_mock_tryon
from app.worker.consumer import process_job_payload

router = APIRouter()


class GarmentItem(BaseModel):
    itemId: str
    category: str
    subcategory: Optional[str] = None
    imageUrl: Optional[str] = None
    imageKey: Optional[str] = None


class DirectTryOnRequest(BaseModel):
    jobId: str
    userId: str
    avatarImageUrl: Optional[str] = None
    garments: Optional[List[GarmentItem]] = None


@router.post("/tryon/process-mock")
async def process_mock_tryon_direct(request: DirectTryOnRequest):
    """Direct testing endpoint: runs enhanced mock try-on synthesis and returns result."""
    garments_dict = [g.model_dump() for g in request.garments] if request.garments else []
    result = await generate_enhanced_mock_tryon(
        job_id=request.jobId,
        user_id=request.userId,
        avatar_url=request.avatarImageUrl,
        garments=garments_dict,
    )
    return {
        "success": True,
        "data": result,
    }


@router.post("/tryon/process")
async def process_tryon_direct(request: DirectTryOnRequest):
    """
    Direct testing endpoint: routes through the full dual-mode worker logic
    (Fashn.ai if key set, else enhanced mock). Returns the callback payload.
    """
    job_data = {
        "jobId": request.jobId,
        "userId": request.userId,
        "avatarImageUrl": request.avatarImageUrl,
        "garments": [g.model_dump() for g in request.garments] if request.garments else [],
    }
    callback_payload = await process_job_payload(job_data)
    return {
        "success": True,
        "data": callback_payload,
    }


