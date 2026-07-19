"""
Shared pytest fixtures.

Every test gets a fresh, isolated SQLite database file and a TestClient
wired to it - so tests never interfere with each other or with your
real dev database (sign_language_platform.db).
"""

import os
import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# IMPORTANT: set DATABASE_URL before importing anything from `app`,
# since app.database reads the env var at import time.
TEST_DB_PATH = f"./test_{uuid.uuid4().hex}.db"
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_PATH}"

from app.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture(scope="session")
def engine():
    eng = create_engine(f"sqlite:///{TEST_DB_PATH}", connect_args={"check_same_thread": False})
    yield eng
    eng.dispose()

    # app.main/app.database create their own separate engine (module-level,
    # imported at startup) pointing at the same file. On Windows, SQLite
    # keeps an OS-level file lock open until every connection referencing
    # it is closed - so we must dispose that engine too, or os.remove()
    # below fails with "file is being used by another process".
    import app.database as db_module
    db_module.engine.dispose()

    if os.path.exists(TEST_DB_PATH):
        try:
            os.remove(TEST_DB_PATH)
        except PermissionError:
            # Non-fatal: on some Windows setups the OS releases the lock
            # a moment late. The file is harmless test scratch data and
            # gets overwritten/ignored on the next run either way.
            pass


@pytest.fixture()
def db_session(engine):
    """
    Drops and recreates every table before each individual test function.
    This guarantees full isolation (no leftover users/courses/sessions
    from a previous test) even though all tests share one SQLite file.
    """
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client(engine, db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def _register(client, email, role="learner", password="TestPass123!"):
    resp = client.post(
        "/auth/register",
        json={"full_name": email.split("@")[0], "email": email, "password": password, "role": role},
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


@pytest.fixture()
def learner_token(client):
    data = _register(client, "learner1@test.com", role="learner")
    return data["access_token"]


@pytest.fixture()
def instructor_token(client):
    data = _register(client, "instructor1@test.com", role="instructor")
    return data["access_token"]


@pytest.fixture()
def admin_token(client):
    data = _register(client, "admin1@test.com", role="admin")
    return data["access_token"]


@pytest.fixture()
def auth_headers():
    def _make(token):
        return {"Authorization": f"Bearer {token}"}
    return _make
