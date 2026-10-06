from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "AI Virtual Wardrobe" in response.json()["name"]


def test_ping():
    response = client.get("/api/ai/ping")
    assert response.status_code == 200
    assert response.json() == {"ping": "pong", "service": "ai-service"}

