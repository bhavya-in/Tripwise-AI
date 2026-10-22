from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def valid_payload():
    return {
        "destination": "  Jaipur,   India ",
        "start_date": "2026-11-12",
        "days": 3,
        "budget": 15000,
        "travelers": 2,
        "interests": ["Culture", "Food", "History"],
    }


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_itinerary_returns_requested_trip():
    response = client.post("/api/itineraries", json=valid_payload())
    assert response.status_code == 200
    body = response.json()
    assert body["destination"] == "Jaipur, India"
    assert body["days"] == 3
    assert len(body["itinerary"]) == 3
    assert body["estimated_total"] <= body["budget"]


def test_invalid_days_are_rejected():
    payload = valid_payload()
    payload["days"] = 0
    response = client.post("/api/itineraries", json=payload)
    assert response.status_code == 422


def test_empty_interests_are_rejected():
    payload = valid_payload()
    payload["interests"] = []
    response = client.post("/api/itineraries", json=payload)
    assert response.status_code == 422
