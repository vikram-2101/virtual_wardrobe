import asyncio
import json
import logging
import threading
import time
from datetime import datetime, timezone

import httpx
import redis

from app.core.config import settings
from app.services.enhanced_mock_vton import generate_enhanced_mock_tryon
from app.services.fashn_vton import VtonProviderError, VtonTimeoutError, run_fashn_tryon
from app.services import storage

logger = logging.getLogger("ai-worker")

_stop_event = threading.Event()
QUEUE_NAME = "vton:tryon:queue"

# ---------------------------------------------------------------------------
# Callback
# ---------------------------------------------------------------------------

async def dispatch_callback(callback_payload: dict) -> bool:
    """Dispatches the job result callback to the Spring Boot backend."""
    headers = {
        "Content-Type": "application/json",
        "X-Internal-Secret": settings.INTERNAL_API_SECRET,
    }
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                settings.BACKEND_CALLBACK_URL,
                json=callback_payload,
                headers=headers,
            )
            if resp.status_code == 200:
                logger.info(
                    f"Callback successful for job {callback_payload.get('jobId')}: {resp.status_code}"
                )
                return True
            else:
                logger.error(
                    f"Callback returned non-200 status {resp.status_code}: {resp.text}"
                )
                return False
    except Exception as e:
        logger.error(f"Failed to post callback to {settings.BACKEND_CALLBACK_URL}: {e}")
        return False


# ---------------------------------------------------------------------------
# Job processor — dual-mode: real Fashn.ai or enhanced mock
# ---------------------------------------------------------------------------

def _use_real_vton() -> bool:
    """Returns True when a Fashn.ai API key is configured."""
    return bool(settings.FASHN_API_KEY and settings.FASHN_API_KEY.strip())


async def process_job_payload(job_data: dict) -> dict:
    """
    Processes a single try-on job payload.

    Routing:
      - If FASHN_API_KEY is set → call Fashn.ai VTON API.
      - Otherwise              → run enhanced mock VTON (PIL composite).

    Returns the callback payload dict.
    """
    job_id = job_data.get("jobId")
    user_id = job_data.get("userId")
    avatar_url = job_data.get("avatarImageUrl")
    garments = job_data.get("garments", [])

    started_at = datetime.now(timezone.utc).isoformat()
    mode = "fashn.ai" if _use_real_vton() else "enhanced-mock"
    logger.info(
        f"Processing TryOnJob {job_id} (user {user_id}, "
        f"{len(garments)} garments, mode={mode})"
    )

    try:
        if _use_real_vton():
            result = await _run_real_vton(job_id, user_id, avatar_url, garments)
        else:
            result = await generate_enhanced_mock_tryon(
                job_id=str(job_id),
                user_id=str(user_id),
                avatar_url=avatar_url,
                garments=garments,
            )

        completed_at = datetime.now(timezone.utc).isoformat()
        return {
            "jobId": str(job_id),
            "status": "COMPLETED",
            "resultImageKey": result["result_image_key"],
            "resultImageUrl": result["result_image_url"],
            "startedAt": started_at,
            "completedAt": completed_at,
        }

    except VtonTimeoutError as e:
        logger.error(f"VTON timeout for job {job_id}: {e}")
        return _failure_payload(job_id, started_at, "PROVIDER_TIMEOUT", str(e))

    except VtonProviderError as e:
        logger.error(f"VTON provider error for job {job_id}: {e}")
        return _failure_payload(job_id, started_at, "PROVIDER_ERROR", str(e))

    except Exception as e:
        logger.exception(f"Unexpected error for job {job_id}: {e}")
        return _failure_payload(job_id, started_at, "INFERENCE_ERROR", str(e))


async def _run_real_vton(
    job_id: str,
    user_id: str,
    avatar_url: str | None,
    garments: list,
) -> dict:
    """
    Calls Fashn.ai with the avatar and the primary garment image,
    uploads the result to S3, and returns result key + URL.

    Raises VtonProviderError / VtonTimeoutError on failure.
    """
    if not avatar_url:
        raise VtonProviderError("No avatar image URL available for real VTON processing.")

    primary = garments[0] if garments else {}
    garment_url = primary.get("imageUrl")
    if not garment_url:
        raise VtonProviderError("No garment image URL available for real VTON processing.")

    category = primary.get("category", "TOPS")

    # Call Fashn.ai — returns raw image bytes
    logger.info(f"Calling Fashn.ai for job {job_id}: avatar={avatar_url[:60]}…")
    image_bytes = await run_fashn_tryon(
        avatar_url=avatar_url,
        garment_url=garment_url,
        category=category,
    )

    # Upload to S3
    result_key = f"tryon/{user_id}/{job_id}.jpg"
    storage.upload_bytes(image_bytes, result_key, content_type="image/jpeg")
    result_url = storage.get_object_url(result_key)

    logger.info(f"Real VTON result uploaded: {result_key}")
    return {
        "result_image_key": result_key,
        "result_image_url": result_url,
    }


def _failure_payload(job_id, started_at: str, error_code: str, error_message: str) -> dict:
    return {
        "jobId": str(job_id),
        "status": "FAILED",
        "errorCode": error_code,
        "errorMessage": error_message,
        "startedAt": started_at,
        "completedAt": datetime.now(timezone.utc).isoformat(),
    }


# ---------------------------------------------------------------------------
# Redis worker loop
# ---------------------------------------------------------------------------

def run_worker_loop():
    """Continuous blocking worker loop for consuming the Redis VTON queue."""
    logger.info(
        f"Connecting to Redis on {settings.REDIS_HOST}:{settings.REDIS_PORT} "
        f"for queue '{QUEUE_NAME}'…"
    )
    mode = "Fashn.ai REAL VTON" if _use_real_vton() else "Enhanced Mock VTON"
    logger.info(f"Worker mode: {mode}")

    r = None
    while not _stop_event.is_set():
        try:
            if r is None:
                r = redis.Redis(
                    host=settings.REDIS_HOST,
                    port=settings.REDIS_PORT,
                    decode_responses=True,
                    socket_connect_timeout=3,
                )
                r.ping()
                logger.info("Connected to Redis. Listening for try-on jobs…")

            item = r.brpop(QUEUE_NAME, timeout=2)
            if item:
                _, raw_message = item
                try:
                    job_data = json.loads(raw_message)
                    logger.info(f"Received job from queue: {job_data.get('jobId')}")
                    callback_payload = asyncio.run(process_job_payload(job_data))
                    asyncio.run(dispatch_callback(callback_payload))
                except Exception as ex:
                    logger.error(f"Error processing queue item: {ex}")

        except redis.ConnectionError:
            logger.warning("Redis connection unavailable. Retrying in 5 seconds…")
            r = None
            time.sleep(5)
        except Exception as e:
            logger.error(f"Unexpected worker error: {e}")
            time.sleep(2)

    logger.info("Try-on worker loop stopped cleanly.")


def start_worker() -> threading.Thread:
    """Starts the Redis queue worker in a background daemon thread."""
    _stop_event.clear()
    worker_thread = threading.Thread(target=run_worker_loop, name="tryon-worker", daemon=True)
    worker_thread.start()
    return worker_thread


def stop_worker():
    """Signals the worker loop to terminate."""
    _stop_event.set()
