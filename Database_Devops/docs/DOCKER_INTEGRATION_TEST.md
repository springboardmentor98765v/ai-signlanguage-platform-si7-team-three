# Local Docker Integration Testing (Milestone 3, Day 6)

**Owner:** Intern 5 (Database & QA)
**SRS deliverable:** Milestone 3, Day 6 — "Docker Compose confirmed to start the entire local stack correctly. At least 2 full-journey local test scripts written. Tests run successfully against the local stack."

## How this differs from `pytest tests/`

The existing `pytest` suite (60 tests) uses FastAPI's `TestClient`,
which runs the app in-process - fast, but doesn't test the real
network layer, real Docker networking between containers, or a truly
separate running database connection.

This test (`scripts/docker_integration_test.py`) instead sends real
HTTP requests to the actual running Docker containers, confirming the
whole stack - backend, database, and their real network connection -
works together, not just the application code in isolation.

## How to run it

```bash
# Terminal 1 - bring up the full stack
docker compose up --build

# Terminal 2 - once you see "Application startup complete"
python -m scripts.docker_integration_test
```

## Test journeys

**Journey 1: Learner full practice flow**
Register instructor + learner -> instructor creates course/lesson ->
learner starts practice -> submits a gesture -> gets a real AI
prediction and assessment -> analytics correctly reflects the session.

**Journey 2: RBAC enforcement**
Confirms a learner is correctly blocked (403) from creating a course,
and an unauthenticated request is correctly rejected (403) - tested
against the real running stack, not just the test client.

## Result: Both journeys passed

```
[OK] Docker stack is running at http://127.0.0.1:8000
=== Journey 1: Learner full practice flow ===
[OK] Registered instructor + learner
[OK] Created course + lesson
[OK] Practice submitted, predicted=B, accuracy=95.6%
[OK] Analytics confirms 1 session(s) recorded
=== Journey 1: PASSED ===
=== Journey 2: RBAC enforcement across roles ===
[OK] Learner correctly blocked from creating a course (403)
[OK] Unauthenticated request correctly rejected (403)
=== Journey 2: PASSED ===
✅ All 2 integration journeys passed against the live Docker stack.
```