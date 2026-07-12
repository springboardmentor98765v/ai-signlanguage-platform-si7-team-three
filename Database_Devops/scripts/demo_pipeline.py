"""
demo_pipeline.py - Runs the ENTIRE platform pipeline automatically.

No manual Swagger UI clicking, no copy-pasting tokens. Just run this
script while your server is up, and watch the full workflow execute:

    Register Instructor -> Create Course -> Add Lesson ->
    Register Learner -> Start Practice -> Submit Gesture ->
    AI Prediction -> Assessment -> Feedback -> Analytics -> Certificate

Usage:
    1. In one terminal:  uvicorn app.main:app --reload
    2. In another terminal (with venv activated):  python demo_pipeline.py
"""

import sys
import time
import uuid

import requests

BASE_URL = "http://127.0.0.1:8000"


def banner(text):
    print("\n" + "=" * 70)
    print(text)
    print("=" * 70)


def check_server_is_up():
    try:
        resp = requests.get(f"{BASE_URL}/health", timeout=3)
        if resp.status_code == 200:
            print(f"[OK] Server is running at {BASE_URL}")
            return True
    except requests.exceptions.ConnectionError:
        pass
    print(f"[ERROR] Cannot reach {BASE_URL}")
    print("        Make sure 'uvicorn app.main:app --reload' is running in another terminal.")
    return False


def register(full_name, email, password, role):
    resp = requests.post(
        f"{BASE_URL}/auth/register",
        json={"full_name": full_name, "email": email, "password": password, "role": role},
    )
    if resp.status_code != 201:
        print(f"[ERROR] Registration failed for {email}: {resp.status_code} {resp.text}")
        sys.exit(1)
    data = resp.json()
    print(f"[OK] Registered {role}: {email} (user id={data['user']['id']})")
    return data["access_token"]


def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


def main():
    banner("STEP 0: Checking server is running")
    if not check_server_is_up():
        sys.exit(1)

    # Use a unique run id so this script can be re-run repeatedly
    # without hitting "Email already registered" errors.
    run_id = uuid.uuid4().hex[:6]

    banner("STEP 1: Register an Instructor")
    instructor_token = register(
        "Demo Instructor", f"instructor_{run_id}@test.com", "Password123!", "instructor"
    )

    banner("STEP 2: Create a Course")
    course_resp = requests.post(
        f"{BASE_URL}/courses",
        json={"title": "Alphabet Basics", "description": "Learn the ASL alphabet", "level": "beginner"},
        headers=auth_headers(instructor_token),
    )
    course = course_resp.json()
    print(f"[OK] Created course: '{course['title']}' (id={course['id']})")

    banner("STEP 3: Add a Lesson (expected sign = 'B')")
    lesson_resp = requests.post(
        f"{BASE_URL}/courses/{course['id']}/lessons",
        json={"title": "Letter B", "expected_sign": "B", "instructions": "Flat open palm, all fingers extended"},
        headers=auth_headers(instructor_token),
    )
    lesson = lesson_resp.json()
    print(f"[OK] Added lesson: '{lesson['title']}' expecting sign '{lesson['expected_sign']}' (id={lesson['id']})")

    banner("STEP 4: Register a Learner")
    learner_token = register(
        "Demo Learner", f"learner_{run_id}@test.com", "Password123!", "learner"
    )

    banner("STEP 5: Start a Practice Session")
    session_resp = requests.post(
        f"{BASE_URL}/practice/start",
        json={"lesson_id": lesson["id"]},
        headers=auth_headers(learner_token),
    )
    session = session_resp.json()
    print(f"[OK] Started practice session (id={session['id']}, status={session['status']})")

    banner("STEP 6: Submit a Gesture (open hand -> should predict 'B')")
    # 21 MediaPipe-style landmarks representing a fully open, flat hand
    open_hand_landmarks = [
        [0.5, 0.9, 0.0],
        [0.4, 0.8, 0.0], [0.35, 0.7, 0.0], [0.3, 0.6, 0.0], [0.25, 0.5, 0.0],
        [0.45, 0.6, 0.0], [0.45, 0.4, 0.0], [0.45, 0.25, 0.0], [0.45, 0.1, 0.0],
        [0.5, 0.6, 0.0], [0.5, 0.4, 0.0], [0.5, 0.25, 0.0], [0.5, 0.1, 0.0],
        [0.55, 0.6, 0.0], [0.55, 0.4, 0.0], [0.55, 0.25, 0.0], [0.55, 0.1, 0.0],
        [0.6, 0.6, 0.0], [0.6, 0.45, 0.0], [0.6, 0.3, 0.0], [0.6, 0.15, 0.0],
    ]
    gesture_resp = requests.post(
        f"{BASE_URL}/practice/submit-gesture",
        json={"session_id": session["id"], "landmarks": open_hand_landmarks, "hold_duration_seconds": 2.0},
        headers=auth_headers(learner_token),
    )
    result = gesture_resp.json()

    print("\n--- AI Prediction & Assessment (PDF Steps 6-7) ---")
    a = result["assessment"]
    print(f"  Predicted sign:      {a['predicted_sign']}  (confidence: {a['confidence']}%)")
    print(f"  Hand shape score:    {a['hand_shape_score']}%")
    print(f"  Finger position:     {a['finger_position_score']}%")
    print(f"  Motion score:        {a['motion_score']}%")
    print(f"  Timing score:        {a['timing_score']}%")
    print(f"  Position score:      {a['position_score']}%")
    print(f"  >>> Overall accuracy: {a['overall_accuracy']}%  |  Passed: {a['passed']}")

    print("\n--- Feedback Engine (PDF Step 8) ---")
    f = result["feedback"]
    print(f"  Mistakes:    {f['mistakes']}")
    print(f"  Suggestions: {f['suggestions']}")

    banner("STEP 7: Check Learning Analytics (PDF Outcome 5)")
    analytics_resp = requests.get(f"{BASE_URL}/analytics/me", headers=auth_headers(learner_token))
    analytics = analytics_resp.json()
    print(f"  Total sessions:      {analytics['total_sessions']}")
    print(f"  Average accuracy:    {analytics['average_accuracy']}%")
    print(f"  Lessons completed:   {analytics['lessons_completed']}")
    print(f"  Weak signs detected: {analytics['weak_signs']}")

    banner("STEP 8: Attempt to Issue a Certificate (PDF Outcome 6)")
    cert_resp = requests.post(
        f"{BASE_URL}/certificates/issue/{course['id']}", headers=auth_headers(learner_token)
    )
    if cert_resp.status_code == 201:
        cert = cert_resp.json()
        print(f"[OK] Certificate issued! Skill level: {cert['skill_level']}, Final score: {cert['final_score']}%")
    else:
        print(f"[INFO] Certificate not issued yet: {cert_resp.json()['detail']}")
        print("       (Average accuracy needs to reach 70%+ - try running this script again")
        print("        a few times to build up practice history, or submit more gestures.)")

    banner("PIPELINE COMPLETE - full workflow executed successfully")
    print(f"Run ID for this session: {run_id}")
    print(f"Instructor: instructor_{run_id}@test.com / Password123!")
    print(f"Learner:    learner_{run_id}@test.com / Password123!")
    print("\nYou can now log in as either user at http://127.0.0.1:8000/docs")
    print("using these credentials if you want to explore manually.")


if __name__ == "__main__":
    main()
