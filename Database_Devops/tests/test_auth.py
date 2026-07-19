"""
Tests for Authentication & User Management (PDF Outcome 2).
"""

from app.auth import hash_password, verify_password


class TestPasswordHashing:
    def test_hash_is_not_plaintext(self):
        hashed = hash_password("MySecret123")
        assert hashed != "MySecret123"

    def test_verify_correct_password(self):
        hashed = hash_password("MySecret123")
        assert verify_password("MySecret123", hashed) is True

    def test_verify_incorrect_password(self):
        hashed = hash_password("MySecret123")
        assert verify_password("WrongPassword", hashed) is False


class TestRegistration:
    def test_register_new_user_succeeds(self, client):
        resp = client.post(
            "/auth/register",
            json={"full_name": "Alice", "email": "alice@test.com", "password": "Password123!", "role": "learner"},
        )
        assert resp.status_code == 201
        body = resp.json()
        assert body["user"]["email"] == "alice@test.com"
        assert body["user"]["role"] == "learner"
        assert "access_token" in body

    def test_register_duplicate_email_fails(self, client):
        payload = {"full_name": "Bob", "email": "bob@test.com", "password": "Password123!", "role": "learner"}
        first = client.post("/auth/register", json=payload)
        assert first.status_code == 201

        second = client.post("/auth/register", json=payload)
        assert second.status_code == 400

    def test_register_defaults_to_learner_role(self, client):
        resp = client.post(
            "/auth/register",
            json={"full_name": "Carl", "email": "carl@test.com", "password": "Password123!"},
        )
        assert resp.status_code == 201
        assert resp.json()["user"]["role"] == "learner"

    def test_password_never_returned_in_response(self, client):
        resp = client.post(
            "/auth/register",
            json={"full_name": "Dana", "email": "dana@test.com", "password": "Password123!", "role": "learner"},
        )
        assert "password" not in resp.json()["user"]
        assert "hashed_password" not in resp.json()["user"]


class TestLogin:
    def test_login_with_correct_credentials(self, client):
        client.post(
            "/auth/register",
            json={"full_name": "Eve", "email": "eve@test.com", "password": "Password123!", "role": "learner"},
        )
        resp = client.post("/auth/login", json={"email": "eve@test.com", "password": "Password123!"})
        assert resp.status_code == 200
        assert "access_token" in resp.json()

    def test_login_with_wrong_password_fails(self, client):
        client.post(
            "/auth/register",
            json={"full_name": "Frank", "email": "frank@test.com", "password": "Password123!", "role": "learner"},
        )
        resp = client.post("/auth/login", json={"email": "frank@test.com", "password": "WrongPass"})
        assert resp.status_code == 401

    def test_login_with_nonexistent_email_fails(self, client):
        resp = client.post("/auth/login", json={"email": "ghost@test.com", "password": "Whatever123"})
        assert resp.status_code == 401


class TestProtectedRoutes:
    def test_me_endpoint_requires_token(self, client):
        resp = client.get("/users/me")
        assert resp.status_code == 403  # HTTPBearer returns 403 when no Authorization header is present at all

    def test_me_endpoint_with_valid_token(self, client, learner_token, auth_headers):
        resp = client.get("/users/me", headers=auth_headers(learner_token))
        assert resp.status_code == 200
        assert resp.json()["email"] == "learner1@test.com"

    def test_me_endpoint_with_garbage_token(self, client):
        resp = client.get("/users/me", headers={"Authorization": "Bearer not-a-real-token"})
        assert resp.status_code == 401
