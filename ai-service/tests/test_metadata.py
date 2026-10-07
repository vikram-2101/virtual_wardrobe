import io
from PIL import Image
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def create_test_image_bytes(color=(0, 0, 128), size=(100, 100), format="JPEG") -> bytes:
    """Helper to generate in-memory test image bytes."""
    img = Image.new("RGB", size, color=color)
    buf = io.BytesIO()
    img.save(buf, format=format)
    return buf.getvalue()


def test_suggest_metadata_success():
    # Navy blue top (aspect ratio ~ 1.0)
    image_bytes = create_test_image_bytes(color=(0, 0, 128), size=(200, 200), format="JPEG")

    files = {
        "file": ("garment.jpg", image_bytes, "image/jpeg")
    }
    response = client.post("/api/ai/metadata/suggest", files=files)

    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "TOPS"
    assert data["subCategory"] == "t-shirt"
    assert data["color"] == "Navy Blue"
    assert data["pattern"] in ["solid", "striped", "graphic"]
    assert data["confidence"] > 0.8
    assert data["isAiGenerated"] is True
    assert isinstance(data["detectedTags"], list)
    assert len(data["detectedTags"]) > 0


def test_suggest_metadata_tall_bottoms():
    # Crimson red pants/jeans silhouette (aspect ratio 1:2)
    image_bytes = create_test_image_bytes(color=(220, 20, 60), size=(100, 200), format="PNG")

    files = {
        "file": ("pants.png", image_bytes, "image/png")
    }
    response = client.post("/api/ai/metadata/suggest", files=files)

    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "BOTTOMS"
    assert data["subCategory"] == "jeans"
    assert data["color"] == "Crimson Red"
    assert data["fit"] == "slim"


def test_suggest_metadata_unsupported_file_type():
    files = {
        "file": ("document.txt", b"plain text", "text/plain")
    }
    response = client.post("/api/ai/metadata/suggest", files=files)
    assert response.status_code == 400
    assert "Unsupported file type" in response.json()["detail"]


def test_suggest_metadata_corrupted_image():
    files = {
        "file": ("bad.jpg", b"corrupted bytes not an image", "image/jpeg")
    }
    response = client.post("/api/ai/metadata/suggest", files=files)
    assert response.status_code == 400
    assert "Invalid or corrupted image data" in response.json()["detail"]

