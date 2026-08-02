"""
Local Docker Compose integration tests (Milestone 3, Day 6).

Unlike tests/ (which use FastAPI's TestClient, running in-process),
this script sends REAL HTTP requests to the actual running Docker
containers - testing the full stack together: backend + database,
exactly as SRS Day 6 requires ("run the entire app locally... check
that a full learner journey works from start to end").

Prerequisite: docker compose up --build must be running first.
"""

import sys
import uuid
import requests

BASE_URL = "http://127.0.0.1:8000"


def check_stack_is_up():
    try:
        resp = requests.get(f"{BASE_URL}/health", timeout=3)
        if resp.status_code == 200:
            print(f"[OK] Docker stack is running at {BASE_URL}")
            return True
    except requests.exceptions.ConnectionError:
        pass
    print(f"[ERROR] Cannot reach {BASE_URL}")
    print("        Run 'docker compose up --build' in another terminal first.")
    return False


def journey_1_learner_full_flow():
    """Journey 1: Register -> Login -> Create course/lesson (as instructor)
    -> Practice -> Get assessment -> Check analytics."""
    print("\n=== Journey 1: Learner full practice flow ===")
    run_id = uuid.uuid4().hex[:6]

    # Register instructor + learner
    instructor = requests.post(f"{BASE_URL}/auth/register", json={
        "full_name": "Test Instructor", "email": f"instructor_{run_id}@test.com",
        "password": "Password123!", "role": "instructor",
    }).json()
    learner = requests.post(f"{BASE_URL}/auth/register", json={
        "full_name": "Test Learner", "email": f"learner_{run_id}@test.com",
        "password": "Password123!", "role": "learner",
    }).json()
    print(f"[OK] Registered instructor + learner (run_id={run_id})")

    instr_headers = {"Authorization": f"Bearer {instructor['access_token']}"}
    learn_headers = {"Authorization": f"Bearer {learner['access_token']}"}

    # Instructor creates course + lesson
    course = requests.post(f"{BASE_URL}/courses",
        json={"title": "Docker Test Course", "level": "beginner"},
        headers=instr_headers).json()
    lesson = requests.post(f"{BASE_URL}/courses/{course['id']}/lessons",
        json={"title": "Letter B", "expected_sign": "B"},
        headers=instr_headers).json()
    print(f"[OK] Created course + lesson (lesson_id={lesson['id']})")

    # Learner practices
    session = requests.post(f"{BASE_URL}/practice/start",
        json={"lesson_id": lesson["id"]}, headers=learn_headers).json()

    open_hand = [
        [0.5, 0.9, 0.0], [0.4, 0.8, 0.0], [0.35, 0.7, 0.0], [0.3, 0.6, 0.0], [0.25, 0.5, 0.0],
        [0.45, 0.6, 0.0], [0.45, 0.4, 0.0], [0.45, 0.25, 0.0], [0.45, 0.1, 0.0],
        [0.5, 0.6, 0.0], [0.5, 0.4, 0.0], [0.5, 0.25, 0.0], [0.5, 0.1, 0.0],
        [0.55, 0.6, 0.0], [0.55, 0.4, 0.0], [0.55, 0.25, 0.0], [0.55, 0.1, 0.0],
        [0.6, 0.6, 0.0], [0.6, 0.45, 0.0], [0.6, 0.3, 0.0], [0.6, 0.15, 0.0],
    ]
    result = requests.post(f"{BASE_URL}/practice/submit-gesture",
        json={"session_id": session["id"], "landmarks": open_hand, "hold_duration_seconds": 2.0},
        headers=learn_headers).json()
    assert "assessment" in result, "Assessment missing from response"
    print(f"[OK] Practice submitted, predicted={result['assessment']['predicted_sign']}, "
          f"accuracy={result['assessment']['overall_accuracy']}%")

    # Check analytics reflects it
    analytics = requests.get(f"{BASE_URL}/analytics/me", headers=learn_headers).json()
    assert analytics["total_sessions"] >= 1, "Analytics didn't update"
    print(f"[OK] Analytics confirms {analytics['total_sessions']} session(s) recorded")

    print("=== Journey 1: PASSED ===")
    return True


def journey_2_rbac_enforcement():
    """Journey 2: Confirm role-based access control works correctly
    against the real running database, not just the test client."""
    print("\n=== Journey 2: RBAC enforcement across roles ===")
    run_id = uuid.uuid4().hex[:6]

    learner = requests.post(f"{BASE_URL}/auth/register", json={
        "full_name": "RBAC Learner", "email": f"rbac_learner_{run_id}@test.com",
        "password": "Password123!", "role": "learner",
    }).json()
    learn_headers = {"Authorization": f"Bearer {learner['access_token']}"}

    # Learner should NOT be able to create a course
    resp = requests.post(f"{BASE_URL}/courses",
        json={"title": "Should Fail", "level": "beginner"}, headers=learn_headers)
    assert resp.status_code == 403, f"Expected 403, got {resp.status_code}"
    print("[OK] Learner correctly blocked from creating a course (403)")

    # No token at all should be rejected
    resp = requests.get(f"{BASE_URL}/users/me")
    assert resp.status_code == 403, f"Expected 403, got {resp.status_code}"
    print("[OK] Unauthenticated request correctly rejected (403)")

    print("=== Journey 2: PASSED ===")
    return True


if __name__ == "__main__":
    if not check_stack_is_up():
        sys.exit(1)

    results = []
    try:
        results.append(journey_1_learner_full_flow())
    except Exception as e:
        print(f"[FAILED] Journey 1: {e}")
        results.append(False)

    try:
        results.append(journey_2_rbac_enforcement())
    except Exception as e:
        print(f"[FAILED] Journey 2: {e}")
        results.append(False)

    print(f"\n{'='*50}")
    if all(results):
        print(f"✅ All {len(results)} integration journeys passed against the live Docker stack.")
        sys.exit(0)
    else:
        print(f"⚠️  {results.count(False)}/{len(results)} journeys failed.")
        sys.exit(1)