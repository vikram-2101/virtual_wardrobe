from fastapi import APIRouter, File, HTTPException, UploadFile, status
from app.services.metadata import MetadataSuggestionResult, extract_clothing_metadata_from_bytes

router = APIRouter()


@router.post(
    "/metadata/suggest",
    response_model=MetadataSuggestionResult,
    summary="Extract AI Clothing Metadata",
    description="Analyzes an uploaded garment image and suggests category, color, pattern, fit, and season attributes."
)
async def suggest_metadata(file: UploadFile = File(...)):
    # Validate content type
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {file.content_type}. Allowed types: {', '.join(allowed_types)}"
        )

    try:
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty"
            )

        result = extract_clothing_metadata_from_bytes(content)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process image for metadata extraction: {str(e)}"
        )

