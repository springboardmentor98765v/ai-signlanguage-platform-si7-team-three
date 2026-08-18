from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200


def test_admin_endpoint_without_token():
    response = client.get("/admin/users")
    assert response.status_code in [401, 403]


def test_course_creation_without_token():
    response = client.post(
        "/courses/",
        json={
            "id": 9999,
            "title": "Test Course",
            "description": "Automated test",
            "modules": []
        }
    )
    assert response.status_code in [401, 403]


def test_notification_creation_without_token():
    response = client.post(
        "/notifications/",
        json={
            "user_id": 12,
            "title": "Test",
            "message": "Automated test"
        }
    )
    assert response.status_code in [401, 403]