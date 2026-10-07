import asyncio
import logging
from typing import Dict, Any

import httpx

from app.core.config import settings

logger = logging.getLogger("ai-service.fashn_vton")


class VtonProviderError(Exception):
    """Raised when the VTON provider returns a non-recoverable error."""
    def __init__(self, message: str, status_code: int | None = None):
        super().__init__(message)
        self.status_code = status_code


class VtonTimeoutError(Exception):
    """Raised when polling for a VTON result exceeds the configured timeout."""


async def run_fashn_tryon(
    avatar_url: str,
    garment_url: str,
    category: str = "tops",
) -> bytes:
    """
    Submits a virtual try-on request to Fashn.ai, polls until completion,
    and returns the raw result image bytes.

    Args:
        avatar_url: Publicly accessible URL of the person/avatar photo.
        garment_url: Publicly accessible URL of the garment/clothing image.
        category: Garment category hint for Fashn.ai ('tops', 'bottoms', 'one-pieces').
                  Defaults to 'tops'.

    Returns:
        Raw JPEG image bytes of the try-on result.

    Raises:
        VtonProviderError: Provider returned an error response.
        VtonTimeoutError: Polling timed out without a result.
    """
    # Normalise category to Fashn-accepted values
    fashn_category = _map_category(category)

    headers = {
        "Authorization": f"Bearer {settings.FASHN_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model_name": settings.FASHN_MODEL,
        "inputs": {
            "model_image": avatar_url,
            "product_image": garment_url,
            "category": fashn_category,
        },
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        # 1. Submit the job
        logger.info(f"Submitting Fashn.ai try-on: category={fashn_category}")
        submit_resp = await client.post(
            f"{settings.FASHN_API_BASE_URL}/run",
            json=payload,
            headers=headers,
        )

        if submit_resp.status_code != 200:
            raise VtonProviderError(
                f"Fashn.ai submission failed [{submit_resp.status_code}]: {submit_resp.text}",
                status_code=submit_resp.status_code,
            )

        submit_data = submit_resp.json()
        prediction_id = submit_data.get("id")
        if not prediction_id:
            raise VtonProviderError(
                f"Fashn.ai returned no prediction ID: {submit_data}"
            )

        logger.info(f"Fashn.ai prediction submitted: id={prediction_id}")

        # 2. Poll for completion
        elapsed = 0
        poll_interval = settings.FASHN_POLL_INTERVAL_SECONDS
        timeout = settings.FASHN_POLL_TIMEOUT_SECONDS

        while elapsed < timeout:
            await asyncio.sleep(poll_interval)
            elapsed += poll_interval

            status_resp = await client.get(
                f"{settings.FASHN_API_BASE_URL}/status/{prediction_id}",
                headers=headers,
            )

            if status_resp.status_code != 200:
                raise VtonProviderError(
                    f"Fashn.ai status check failed [{status_resp.status_code}]: {status_resp.text}",
                    status_code=status_resp.status_code,
                )

            status_data = status_resp.json()
            job_status = status_data.get("status", "")
            logger.debug(f"Fashn.ai poll [{elapsed}s]: id={prediction_id} status={job_status}")

            if job_status == "completed":
                # Extract result image URL
                output = status_data.get("output")
                if not output:
                    raise VtonProviderError(
                        f"Fashn.ai job completed but output is empty: {status_data}"
                    )
                # output may be a list or a direct URL string
                result_url = output[0] if isinstance(output, list) else output
                logger.info(f"Fashn.ai try-on completed: result_url={result_url}")

                # 3. Download the result image
                img_resp = await client.get(result_url, timeout=30.0)
                if img_resp.status_code != 200:
                    raise VtonProviderError(
                        f"Failed to download Fashn.ai result [{img_resp.status_code}]"
                    )
                return img_resp.content

            elif job_status in ("failed", "error", "canceled"):
                error_msg = status_data.get("error") or status_data.get("message") or job_status
                raise VtonProviderError(
                    f"Fashn.ai job {prediction_id} failed with status '{job_status}': {error_msg}"
                )

            # Still processing — continue polling

        raise VtonTimeoutError(
            f"Fashn.ai job {prediction_id} timed out after {timeout}s without completing."
        )


def _map_category(category: str) -> str:
    """Maps internal wardrobe category names to Fashn.ai category values."""
    mapping = {
        "TOPS": "tops",
        "SHIRTS": "tops",
        "BLOUSES": "tops",
        "JACKETS": "tops",
        "OUTERWEAR": "tops",
        "SWEATERS": "tops",
        "BOTTOMS": "bottoms",
        "PANTS": "bottoms",
        "JEANS": "bottoms",
        "SKIRTS": "bottoms",
        "SHORTS": "bottoms",
        "DRESSES": "one-pieces",
        "JUMPSUITS": "one-pieces",
        "ROMPERS": "one-pieces",
        "ONE-PIECES": "one-pieces",
    }
    return mapping.get(category.upper(), "tops")

