"""
Test suite for Phase 10 VTON worker and Fashn.ai adapter.

Coverage:
  - test_generate_enhanced_mock_tryon        Phase 9→10: enhanced mock synthesis
  - test_process_job_payload_success_mock    Mock path: COMPLETED callback
  - test_process_job_payload_failure_mock    Mock path: INFERENCE_ERROR on exception
  - test_tryon_direct_api_endpoint           API: /tryon/process-mock endpoint
  - test_real_vton_success                   Real VTON path: COMPLETED with image key
  - test_real_vton_provider_error            Real path: VtonProviderError → PROVIDER_ERROR
  - test_real_vton_timeout                   Real path: VtonTimeoutError → PROVIDER_TIMEOUT
  - test_mock_fallback_when_no_api_key       Routing: empty key → mock path called
  - test_fashn_adapter_submits_and_polls     Unit: adapter polls until 'completed'
  - test_fashn_adapter_provider_fails        Unit: non-2xx submit → VtonProviderError
  - test_fashn_adapter_poll_timeout          Unit: never 'completed' → VtonTimeoutError
"""
import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from httpx import AsyncClient, ASGITransport, Response

from app.main import app
from app.services.enhanced_mock_vton import generate_enhanced_mock_tryon
from app.services.fashn_vton import (
    VtonProviderError,
    VtonTimeoutError,
    run_fashn_tryon,
    _map_category,
)
from app.worker.consumer import process_job_payload, dispatch_callback


# ---------------------------------------------------------------------------
# Enhanced Mock Tests
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_generate_enhanced_mock_tryon():
    """Enhanced mock generates image, uploads to S3, returns key and URL."""
    with patch("app.services.storage.upload_bytes") as mock_upload, \
         patch("app.services.storage.get_object_url") as mock_get_url:
        mock_upload.return_value = "tryon/user-123/job-456.jpg"
        mock_get_url.return_value = "http://localhost:9000/wardrobe-storage/tryon/user-123/job-456.jpg"

        result = await generate_enhanced_mock_tryon(
            job_id="job-456",
            user_id="user-123",
            avatar_url=None,
            garments=[
                {"category": "TOPS", "subcategory": "t-shirt", "imageUrl": None},
                {"category": "BOTTOMS", "subcategory": "jeans", "imageUrl": None},
            ],
        )

        assert result["result_image_key"] == "tryon/user-123/job-456.jpg"
        assert result["result_image_url"] == "http://localhost:9000/wardrobe-storage/tryon/user-123/job-456.jpg"
        assert result["processing_time_ms"] >= 0
        mock_upload.assert_called_once()


@pytest.mark.asyncio
async def test_process_job_payload_success_mock():
    """Mock path: successful job produces COMPLETED callback payload."""
    with patch("app.worker.consumer._use_real_vton", return_value=False), \
         patch("app.worker.consumer.generate_enhanced_mock_tryon", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = {
            "result_image_key": "tryon/u1/j1.jpg",
            "result_image_url": "http://localhost:9000/tryon/u1/j1.jpg",
            "processing_time_ms": 50,
        }

        callback = await process_job_payload({
            "jobId": "j1",
            "userId": "u1",
            "avatarImageUrl": "http://avatar.jpg",
            "garments": [{"category": "TOPS"}],
        })

        assert callback["jobId"] == "j1"
        assert callback["status"] == "COMPLETED"
        assert callback["resultImageKey"] == "tryon/u1/j1.jpg"
        assert callback["resultImageUrl"] == "http://localhost:9000/tryon/u1/j1.jpg"


@pytest.mark.asyncio
async def test_process_job_payload_failure_mock():
    """Mock path: unexpected exception maps to INFERENCE_ERROR."""
    with patch("app.worker.consumer._use_real_vton", return_value=False), \
         patch("app.worker.consumer.generate_enhanced_mock_tryon",
               new_callable=AsyncMock, side_effect=RuntimeError("GPU OOM")):
        callback = await process_job_payload({"jobId": "j-err", "userId": "u-err"})

        assert callback["status"] == "FAILED"
        assert callback["errorCode"] == "INFERENCE_ERROR"
        assert "GPU OOM" in callback["errorMessage"]


@pytest.mark.asyncio
async def test_tryon_direct_api_endpoint():
    """API endpoint /tryon/process-mock returns 200 with result data."""
    with patch("app.services.storage.upload_bytes"), \
         patch("app.services.storage.get_object_url",
               return_value="http://localhost:9000/wardrobe-storage/tryon/user-123/job-direct.jpg"):

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            res = await ac.post(
                "/api/ai/tryon/process-mock",
                json={
                    "jobId": "job-direct",
                    "userId": "user-123",
                    "garments": [{"itemId": "item-1", "category": "TOPS", "subcategory": "polo"}],
                },
            )

        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert "result_image_key" in data["data"]


# ---------------------------------------------------------------------------
# Real VTON (Fashn.ai) Worker Integration Tests
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_real_vton_success():
    """Real VTON path: Fashn.ai returns bytes → uploaded → COMPLETED callback."""
    fake_image_bytes = b"\xff\xd8\xff\xe0" + b"\x00" * 100  # fake JPEG bytes

    with patch("app.worker.consumer._use_real_vton", return_value=True), \
         patch("app.worker.consumer.run_fashn_tryon",
               new_callable=AsyncMock, return_value=fake_image_bytes) as mock_fashn, \
         patch("app.worker.consumer.storage.upload_bytes") as mock_upload, \
         patch("app.worker.consumer.storage.get_object_url",
               return_value="http://minio/tryon/u1/j-real.jpg"):

        callback = await process_job_payload({
            "jobId": "j-real",
            "userId": "u1",
            "avatarImageUrl": "http://avatar.jpg",
            "garments": [{"category": "TOPS", "imageUrl": "http://garment.jpg"}],
        })

        assert callback["status"] == "COMPLETED"
        assert callback["resultImageKey"] == "tryon/u1/j-real.jpg"
        mock_fashn.assert_called_once_with(
            avatar_url="http://avatar.jpg",
            garment_url="http://garment.jpg",
            category="TOPS",
        )
        mock_upload.assert_called_once()


@pytest.mark.asyncio
async def test_real_vton_provider_error():
    """Real VTON path: VtonProviderError maps to PROVIDER_ERROR error code."""
    with patch("app.worker.consumer._use_real_vton", return_value=True), \
         patch("app.worker.consumer.run_fashn_tryon",
               new_callable=AsyncMock,
               side_effect=VtonProviderError("Fashn.ai returned 500")):

        callback = await process_job_payload({
            "jobId": "j-err",
            "userId": "u1",
            "avatarImageUrl": "http://avatar.jpg",
            "garments": [{"category": "TOPS", "imageUrl": "http://garment.jpg"}],
        })

        assert callback["status"] == "FAILED"
        assert callback["errorCode"] == "PROVIDER_ERROR"
        assert "Fashn.ai returned 500" in callback["errorMessage"]


@pytest.mark.asyncio
async def test_real_vton_timeout():
    """Real VTON path: VtonTimeoutError maps to PROVIDER_TIMEOUT error code."""
    with patch("app.worker.consumer._use_real_vton", return_value=True), \
         patch("app.worker.consumer.run_fashn_tryon",
               new_callable=AsyncMock,
               side_effect=VtonTimeoutError("Timed out after 120s")):

        callback = await process_job_payload({
            "jobId": "j-timeout",
            "userId": "u1",
            "avatarImageUrl": "http://avatar.jpg",
            "garments": [{"category": "TOPS", "imageUrl": "http://garment.jpg"}],
        })

        assert callback["status"] == "FAILED"
        assert callback["errorCode"] == "PROVIDER_TIMEOUT"
        assert "120s" in callback["errorMessage"]


@pytest.mark.asyncio
async def test_mock_fallback_when_no_api_key():
    """When FASHN_API_KEY is empty, the enhanced mock path is used."""
    with patch("app.worker.consumer._use_real_vton", return_value=False), \
         patch("app.worker.consumer.generate_enhanced_mock_tryon",
               new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = {
            "result_image_key": "tryon/u2/j-mock.jpg",
            "result_image_url": "http://minio/tryon/u2/j-mock.jpg",
            "processing_time_ms": 30,
        }

        callback = await process_job_payload({
            "jobId": "j-mock",
            "userId": "u2",
            "avatarImageUrl": None,
            "garments": [],
        })

        mock_gen.assert_called_once()
        assert callback["status"] == "COMPLETED"


# ---------------------------------------------------------------------------
# Fashn.ai Adapter Unit Tests
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_fashn_adapter_submits_and_polls():
    """Adapter: submits job, polls twice (processing → completed), returns image bytes."""
    fake_bytes = b"\xff\xd8\xff" + b"\x00" * 50

    submit_resp = MagicMock()
    submit_resp.status_code = 200
    submit_resp.json.return_value = {"id": "pred-abc123", "error": None}

    poll_processing_resp = MagicMock()
    poll_processing_resp.status_code = 200
    poll_processing_resp.json.return_value = {"status": "processing"}

    poll_completed_resp = MagicMock()
    poll_completed_resp.status_code = 200
    poll_completed_resp.json.return_value = {
        "status": "completed",
        "output": ["https://cdn.fashn.ai/result.jpg"],
    }

    img_resp = MagicMock()
    img_resp.status_code = 200
    img_resp.content = fake_bytes

    mock_client = AsyncMock()
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=False)
    mock_client.post = AsyncMock(return_value=submit_resp)
    mock_client.get = AsyncMock(side_effect=[
        poll_processing_resp,
        poll_completed_resp,
        img_resp,
    ])

    with patch("app.services.fashn_vton.asyncio.sleep", new_callable=AsyncMock), \
         patch("app.services.fashn_vton.httpx.AsyncClient", return_value=mock_client), \
         patch("app.services.fashn_vton.settings") as mock_settings:
        mock_settings.FASHN_API_KEY = "test_key"
        mock_settings.FASHN_API_BASE_URL = "https://api.fashn.ai/v1"
        mock_settings.FASHN_MODEL = "tryon"
        mock_settings.FASHN_POLL_TIMEOUT_SECONDS = 30
        mock_settings.FASHN_POLL_INTERVAL_SECONDS = 3

        result = await run_fashn_tryon(
            avatar_url="http://avatar.jpg",
            garment_url="http://garment.jpg",
            category="TOPS",
        )

    assert result == fake_bytes


@pytest.mark.asyncio
async def test_fashn_adapter_provider_fails():
    """Adapter: non-2xx submission response raises VtonProviderError."""
    error_resp = MagicMock()
    error_resp.status_code = 422
    error_resp.text = "Unprocessable Entity"

    mock_client = AsyncMock()
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=False)
    mock_client.post = AsyncMock(return_value=error_resp)

    with patch("app.services.fashn_vton.httpx.AsyncClient", return_value=mock_client):
        with pytest.raises(VtonProviderError) as exc_info:
            await run_fashn_tryon("http://a.jpg", "http://g.jpg", "TOPS")

    assert "422" in str(exc_info.value)


@pytest.mark.asyncio
async def test_fashn_adapter_poll_timeout():
    """Adapter: polling never resolves within timeout → VtonTimeoutError."""
    submit_resp = MagicMock()
    submit_resp.status_code = 200
    submit_resp.json.return_value = {"id": "pred-slow", "error": None}

    still_processing = MagicMock()
    still_processing.status_code = 200
    still_processing.json.return_value = {"status": "processing"}

    mock_client = AsyncMock()
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=False)
    mock_client.post = AsyncMock(return_value=submit_resp)
    # Always returns "processing" — will time out
    mock_client.get = AsyncMock(return_value=still_processing)

    with patch("app.services.fashn_vton.asyncio.sleep", new_callable=AsyncMock), \
         patch("app.services.fashn_vton.httpx.AsyncClient", return_value=mock_client), \
         patch("app.services.fashn_vton.settings") as mock_settings:
        mock_settings.FASHN_API_KEY = "test_key"
        mock_settings.FASHN_API_BASE_URL = "https://api.fashn.ai/v1"
        mock_settings.FASHN_MODEL = "tryon"
        mock_settings.FASHN_POLL_TIMEOUT_SECONDS = 6   # 2 poll cycles of 3s
        mock_settings.FASHN_POLL_INTERVAL_SECONDS = 3

        with pytest.raises(VtonTimeoutError) as exc_info:
            await run_fashn_tryon("http://a.jpg", "http://g.jpg", "TOPS")

    assert "pred-slow" in str(exc_info.value)


# ---------------------------------------------------------------------------
# Category Mapping
# ---------------------------------------------------------------------------

def test_category_mapping():
    """_map_category correctly maps all wardrobe categories to Fashn values."""
    assert _map_category("TOPS") == "tops"
    assert _map_category("BOTTOMS") == "bottoms"
    assert _map_category("DRESSES") == "one-pieces"
    assert _map_category("JUMPSUITS") == "one-pieces"
    assert _map_category("UNKNOWN") == "tops"   # default fallback
