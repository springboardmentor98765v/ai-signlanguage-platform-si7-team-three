"""
Tests for Course Service + Role-Based Access Control (PDF Outcome 1 & 2).

PDF: "A learner can practice signs but cannot create courses.
An instructor can monitor student performance but cannot change
system settings."
"""


class TestCourseCreationRBAC:
    def test_learner_cannot_create_course(self, client, learner_token, auth_headers):
        resp = client.post(
            "/courses",
            json={"title": "Alphabet Basics", "description": "ABCs", "level": "beginner"},
            headers=auth_headers(learner_token),
        )
        assert resp.status_code == 403

    def test_instructor_can_create_course(self, client, instructor_token, auth_headers):
        resp = client.post(
            "/courses",
            json={"title": "Alphabet Basics", "description": "ABCs", "level": "beginner"},
            headers=auth_headers(instructor_token),
        )
        assert resp.status_code == 201
        assert resp.json()["title"] == "Alphabet Basics"

    def test_admin_can_create_course(self, client, admin_token, auth_headers):
        resp = client.post(
            "/courses",
            json={"title": "Numbers", "description": "0-9", "level": "beginner"},
            headers=auth_headers(admin_token),
        )
        assert resp.status_code == 201

    def test_unauthenticated_cannot_create_course(self, client):
        resp = client.post("/courses", json={"title": "X", "level": "beginner"})
        assert resp.status_code == 403  # HTTPBearer returns 403 when no Authorization header is present at all


class TestCourseBrowsing:
    def test_any_authenticated_user_can_list_courses(self, client, learner_token, auth_headers):
        resp = client.get("/courses", headers=auth_headers(learner_token))
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_get_nonexistent_course_404s(self, client, learner_token, auth_headers):
        resp = client.get("/courses/9999", headers=auth_headers(learner_token))
        assert resp.status_code == 404


class TestLessonCreationRBAC:
    def test_learner_cannot_add_lesson(self, client, instructor_token, learner_token, auth_headers):
        course = client.post(
            "/courses",
            json={"title": "Alphabet", "level": "beginner"},
            headers=auth_headers(instructor_token),
        ).json()

        resp = client.post(
            f"/courses/{course['id']}/lessons",
            json={"title": "Letter A", "expected_sign": "A"},
            headers=auth_headers(learner_token),
        )
        assert resp.status_code == 403

    def test_instructor_can_add_lesson(self, client, instructor_token, auth_headers):
        course = client.post(
            "/courses",
            json={"title": "Alphabet", "level": "beginner"},
            headers=auth_headers(instructor_token),
        ).json()

        resp = client.post(
            f"/courses/{course['id']}/lessons",
            json={"title": "Letter A", "expected_sign": "A", "instructions": "Make a fist"},
            headers=auth_headers(instructor_token),
        )
        assert resp.status_code == 201
        assert resp.json()["expected_sign"] == "A"

    def test_add_lesson_to_nonexistent_course_404s(self, client, instructor_token, auth_headers):
        resp = client.post(
            "/courses/9999/lessons",
            json={"title": "Letter A", "expected_sign": "A"},
            headers=auth_headers(instructor_token),
        )
        assert resp.status_code == 404


class TestUserManagementRBAC:
    def test_learner_cannot_list_all_users(self, client, learner_token, auth_headers):
        resp = client.get("/users", headers=auth_headers(learner_token))
        assert resp.status_code == 403

    def test_admin_can_list_all_users(self, client, admin_token, auth_headers):
        resp = client.get("/users", headers=auth_headers(admin_token))
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_admin_can_deactivate_user(self, client, admin_token, learner_token, auth_headers):
        me = client.get("/users/me", headers=auth_headers(learner_token)).json()
        resp = client.patch(f"/users/{me['id']}/deactivate", headers=auth_headers(admin_token))
        assert resp.status_code == 200
        assert resp.json()["is_active"] is False

        # deactivated user should no longer be able to log in
        login_resp = client.post("/auth/login", json={"email": "learner1@test.com", "password": "TestPass123!"})
        assert login_resp.status_code == 403
