from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_signup_success():
    payload = {
        "email": "newuser@example.com",
        "password": "Password@123",
        "full_name": "New User",
    }
    response = client.post("/auth/signup", json=payload)
    assert response.status_code == 201
    assert response.json()["user"]["email"] == "newuser@example.com"


def test_login_success():
    response = client.post(
        "/auth/login",
        json={"email": "admin@brightloop.dev", "password": "Admin@123"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_invalid_credentials():
    response = client.post(
        "/auth/login",
        json={"email": "admin@brightloop.dev", "password": "wrong-password"},
    )
    assert response.status_code == 401
