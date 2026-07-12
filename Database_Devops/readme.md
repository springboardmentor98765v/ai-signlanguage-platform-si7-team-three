# AI-Powered Sign Language Learning & Assessment Platform - Backend

> **Milestone 1 context:** per the team's SRS, this repo is organized
> around 5 intern domains. This README (and the code) currently covers
> more than just one domain's Milestone 1 scope, since it was built
> before the SRS's domain split was finalized. See `docs/` for the
> Intern 5 (Database & DevOps)-specific deliverables, and treat
> everything else here as a head start for whichever teammate owns
> that domain, not a replacement for their work.

A complete FastAPI backend implementing all 7 outcomes from the original
platform spec, plus a full QA/DevOps layer (tests, Docker, CI/CD,
migrations, monitoring).

## Docs for the team (Intern 5 deliverables)

- [`docs/ER_DIAGRAM.md`](docs/ER_DIAGRAM.md) — full schema, renders on GitHub
- [`docs/GIT_WORKFLOW.md`](docs/GIT_WORKFLOW.md) — branching strategy, commit conventions, PR checklist
- [`docs/DEPLOYMENT_NOTE.md`](docs/DEPLOYMENT_NOTE.md) — Milestone 1 deployment status against the SRS acceptance criteria
- [`deploy/CLOUD_DEPLOYMENT.md`](deploy/CLOUD_DEPLOYMENT.md) — for later milestones (cloud deployment is explicitly out of scope for Milestone 1)

## Project outcomes -> where they live

| # | Outcome | Implementation |
|---|---------|-----------------|
| 1 | Learning platform (courses/lessons) | `app/routers/courses_router.py`, `app/models.py` (`Course`, `Lesson`) |
| 2 | Secure auth + RBAC | `app/auth.py`, `app/routers/auth_router.py`, `app/routers/users_router.py` |
| 3 | Gesture recognition & assessment | `app/services/ai_prediction.py`, `app/services/assessment_engine.py` |
| 4 | Real-time feedback & error correction | `app/services/feedback_engine.py` |
| 5 | Learning analytics & recommendations | `app/services/analytics_engine.py`, `app/routers/analytics_router.py` |
| 6 | Assessment, certification, reporting | `app/routers/analytics_router.py` (`/certificates/issue/...`) |
| 7 | End-to-end integration | `app/main.py` wires every layer into one API |

## Roles & RBAC

Four roles per the spec: `learner`, `instructor`, `accessibility_trainer`, `admin`.
- **Learners** practice signs and view their own results.
- **Instructors / Accessibility Trainers** create courses and lessons.
- **Admins** manage users.

Enforced via `app.auth.require_role(...)` dependency on each route.

## The core pipeline

`POST /practice/start` -> `POST /practice/submit-gesture` runs the full
PDF "key workflow" in one call:

```
landmarks (21 MediaPipe hand points)
   -> AI/ML Prediction (app/services/ai_prediction.py)
   -> Assessment Engine, 5-parameter weighted score (app/services/assessment_engine.py)
   -> Feedback Engine, mistakes + suggestions (app/services/feedback_engine.py)
   -> Analytics update, weak-sign detection (app/services/analytics_engine.py)
```

> **Note for the AI/ML and Computer Vision teammates:** `ai_prediction.py`
> currently ships a lightweight geometric heuristic (finger-extension
> ratios) instead of a trained model, so the rest of the pipeline is
> fully testable without GPU/model dependencies. Replace the inside of
> `predict()` with your real classifier - just keep the function
> signature (`predict(landmarks) -> PredictionResult`) the same so
> nothing downstream breaks.

## Database migrations (Alembic)

Schema changes are managed via Alembic, not just `Base.metadata.create_all()`:

```bash
# Apply all migrations (creates every table from scratch on a fresh DB)
alembic upgrade head

# After changing app/models.py, generate a new migration
alembic revision --autogenerate -m "describe your schema change"

# Review the generated file in migrations/versions/ before committing -
# autogenerate is a good first draft, not always perfect

# Roll back the most recent migration if something's wrong
alembic downgrade -1
```

`app/database.py`'s `init_db()` (called on app startup) still uses
`create_all()` directly as a convenience for local dev/tests so you
don't have to run migrations just to try the API - but Alembic is the
source of truth for schema evolution and what the team should use once
multiple people are touching the schema.

## Local setup

```bash
python -m venv venv
source venv/bin/activate              # Windows: venv\Scripts\activate
pip install -r requirements-dev.txt   # includes prod deps + pytest/ruff
cp .env.example .env                  # adjust SLP_SECRET_KEY etc.
uvicorn app.main:app --reload
```

Visit `http://localhost:8000/docs` for interactive Swagger UI.

## Easiest way to see the whole pipeline work: `demo_pipeline.py`

Manually clicking through Swagger UI (register -> copy token -> authorize
-> create course -> ...) is tedious and error-prone (stray quotes/commas
when pasting tokens, wrong auth scheme, etc). Instead, with the server
running in one terminal, run this in another:

```bash
python scripts/demo_pipeline.py
```

This automatically registers an instructor + learner, creates a course
and lesson, starts a practice session, submits a gesture, and prints
the full AI prediction -> assessment -> feedback -> analytics ->
certificate result. It's safe to re-run repeatedly (uses a random
run ID each time so it never collides with existing users).

Use this to confirm everything works, then go explore `/docs` manually
with the printed demo credentials if you want to click around yourself.

## Running tests (QA layer)

```bash
pytest tests/ -v                                  # run all tests
pytest tests/ --cov=app --cov-report=term-missing # with coverage (currently ~97%)
ruff check app tests                              # lint
```

Tests are fully isolated: every test function gets a fresh SQLite
schema (see `tests/conftest.py`), so nothing leaks between tests and
none of them touch your real dev database.

| File | Covers |
|------|--------|
| `tests/test_auth.py` | Password hashing, registration, login, protected routes |
| `tests/test_courses_and_rbac.py` | Course/lesson CRUD + role-based access control |
| `tests/test_practice_pipeline.py` | Full practice -> assessment -> feedback -> analytics -> certificate flow |
| `tests/test_services_unit.py` | Pure unit tests for the AI/assessment/feedback services, no HTTP/DB |

## Docker

```bash
docker compose up --build
```

Runs the full stack:
- **Backend API** at `http://localhost:8000`
- **Prometheus** at `http://localhost:9090` (scrapes backend `/metrics` every 10s)
- **Grafana** at `http://localhost:3000` (login: `admin` / `admin` by default - change via `GRAFANA_ADMIN_PASSWORD` env var) with a pre-provisioned "Sign Language Platform - API Overview" dashboard showing request rate, p95 latency, status codes, and memory usage

Persistent SQLite volume included. See comments in `docker-compose.yml` for swapping in Postgres.

## Monitoring & Logging

Per the PDF's Infrastructure Layer ("Monitoring & Logging - Prometheus / Grafana"):
- `GET /metrics` on the backend exposes real Prometheus-format metrics (request counts, latency histograms, in-flight requests) via `prometheus-fastapi-instrumentator`
- `monitoring/prometheus.yml` configures Prometheus to scrape that endpoint
- `monitoring/grafana/provisioning/` auto-loads a Prometheus datasource and a starter dashboard on Grafana startup - no manual clicking needed
- Structured request logging is also active in `app/main.py` (method, path, status, duration) for anything not yet in a dashboard

## Cloud Deployment

See `deploy/CLOUD_DEPLOYMENT.md` for step-by-step AWS ECS Fargate and
Azure App Service deployment guides, plus `deploy/ecs-task-definition.json`
as a ready-to-edit ECS task definition template. Neither has been
executed against a real cloud account from this repo (that requires
your own AWS/Azure credentials and billing) - follow the guide when
you're ready to actually deploy.

## CI/CD

`.github/workflows/ci.yml` runs on every push/PR:
1. `ruff check` (lint)
2. `pytest` with coverage
3. Docker image build (validates the Dockerfile, doesn't push anywhere)

## Backup & disaster recovery

```bash
./scripts/backup_db.sh
```

Copies the SQLite DB into `backups/` with a timestamp and prunes
anything beyond the 7 most recent backups. Extend this script for
`pg_dump` if/when the project moves to Postgres.

## What's NOT included yet (next steps for the team)

- Real trained gesture-classification model (AI/ML domain) - swap into `ai_prediction.py`
- Real MediaPipe hand-tracking integration (Computer Vision domain) - currently the API expects landmarks to already be extracted
- Frontend (Frontend domain)
- Actually running the AWS/Azure deployment steps in `deploy/CLOUD_DEPLOYMENT.md` against a real account (guide is ready, execution requires your own cloud credentials)
