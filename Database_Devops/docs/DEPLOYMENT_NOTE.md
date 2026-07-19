# Milestone 1 Deployment Note

**Owner:** Intern 5 (Database & DevOps)
**Milestone 1 deliverable:** Day 7 — "Fully integrated Milestone 1 environment verified end-to-end; deployment note delivered."

## Update — Milestone 2 Progress (as of today)

**Database:** Migrated from local SQLite to a live Supabase (PostgreSQL)
cloud database. All 12 tables confirmed live, including Milestone 2
additions (recommendations, instructor_students, weekly_analytics).

**Backup/Restore:** Tested and working against the live Supabase
database. See `docs/BACKUP_AND_RESTORE.md` for the script and proof
of a real backup + restore test.

**Hosting:** Not yet live. Render account created; blocked on org
admin approval to connect to the team's GitHub org. Pending mentor
action.

**Team activity:** Other interns now have active branches with real
work in progress: `Frontend`, `arya-backend`, `arya-postgres-integration`.
The "known gaps" section below (written during Milestone 1) may be
partially outdated - check with those teammates directly for their
current status rather than relying solely on this note.

Per SRS Section 1.4, **cloud production deployment is explicitly out
of scope for Milestone 1.** This note covers the required scope only:
running the full stack locally via `docker-compose`, verified
end-to-end by every intern's machine.

## What "deployed" means for Milestone 1

Per SRS Non-Functional Requirements: *"the entire Milestone 1 stack
(backend + AI service + database) must run via docker-compose on any
team member's machine."* That's the acceptance bar — not a live
public URL.

## How to bring up the full stack

```bash
git clone <repo-url>
cd sign_language_platform
cp .env.example .env
docker compose up --build
```

This starts:
- **Backend** (FastAPI) on `http://localhost:8000`
- **Database**: PostgreSQL, per SRS Day 2 ("Set up PostgreSQL (or MySQL)
  instance"), running as its own container. A SQLite fallback for
  quick local testing without Docker is documented in `.env.example`
  if needed.
- **AI Prediction microservice** (its own container, port `:8001`) —
  see note below
- **Monitoring** (Prometheus on `:9090`, Grafana on `:3000`) — not
  required by the SRS but included since it was already built; safe
  to ignore for the Milestone 1 demo if time is short

> **Note on the AI service:** the SRS calls for the AI/CV service to
> be a separate containerized service (Intern 3's domain). This is now
> genuinely true structurally: `ai_service/main.py` + `Dockerfile.ai`
> run as their own independent FastAPI app and container (`slp_ai_service`
> in `docker-compose.yml`, port `8001`), with a real `/predict` endpoint
> matching the SRS's exact contract: `{predicted_sign, confidence}`.
>
> **What's still a placeholder:** the actual prediction logic inside
> that service (`app/services/ai_prediction.py`) is a geometric
> heuristic, not a real MediaPipe/trained model - so the service
> architecture is correct and complete, but the intelligence behind it
> isn't real AI yet. When Intern 3's real model is ready, its logic
> replaces the inside of `predict()` in that file - the service
> wrapper, container, and API contract around it don't need to change.
>
> The main backend currently calls this prediction logic in-process
> (importing the function directly) rather than over HTTP between
> containers, purely for simplicity during Milestone 1 development.
> Switching the backend to call `ai_service` over HTTP instead is a
> small, well-contained change once the team wants the full
> microservice separation at runtime, not just at the container level.

## End-to-end verification performed

Per SRS Section 8.1 Integration Sequence:

| Step | Status | How it was verified |
|------|--------|---------------------|
| 1. Full stack starts via docker-compose | ✅ | `docker compose up --build` |
| 2. Auth & Course APIs work against the live DB | ✅ | `pytest tests/test_auth.py tests/test_courses_and_rbac.py` (24 tests) + `scripts/demo_pipeline.py` |
| 3. Frontend hits live backend | ⏳ Pending Intern 1 | N/A - no frontend built as of this note |
| 4. AI service called from Practice flow | ⚠️ Placeholder | `predict()` currently a geometric heuristic, not real MediaPipe |
| 5. Assessment/Feedback/Analytics process AI output | ✅ | `pytest tests/test_practice_pipeline.py` (13 tests) + `scripts/demo_pipeline.py` |
| 6. Full team walkthrough | ⏳ Pending team sync | Schedule for Day 7 per SRS |

## Known gaps against SRS Milestone 1 acceptance criteria

Being direct about what's not yet real, per SRS Section 8.2:

- **"AI service returns a predicted sign for at least one sample
  letter"** — technically true (the heuristic returns *a* sign), but
  it is not MediaPipe-based and does not yet meet FR-3's "detect a
  hand in a webcam frame" requirement, since it takes landmarks as
  input rather than a raw frame. Intern 3 needs to close this gap.
- **Frontend flow** — no UI exists yet; the pipeline has only been
  verified via `scripts/demo_pipeline.py` and Swagger UI (`/docs`).
  This is Intern 1's Day 1-7 scope, not yet started as of this note.

## Environment variables required

See `.env.example`. Minimum for local docker-compose:
```
DATABASE_URL=sqlite:////app/data/sign_language_platform.db
SLP_SECRET_KEY=<any-random-string-for-dev>
```