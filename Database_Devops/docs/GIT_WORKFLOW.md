# Git Workflow & Branching Strategy

**Owner:** Intern 5 (Database & DevOps)
**Milestone 1 deliverable:** Day 6 — "Git workflow, CI stub and setup documentation ready for all interns to follow."

## Repository structure

Single mono-repo for Milestone 1 (five domains, one FastAPI backend
project) — simpler to keep in sync than five separate repos for a
7-day sprint with heavy cross-domain dependencies (see SRS Section 5).

```
sign_language_platform/
  app/            <- Intern 2 (routers/auth, courses) + Intern 4 (routers/practice, analytics)
  app/services/   <- Intern 3 (ai_prediction.py) + Intern 4 (assessment/feedback/analytics engines)
  app/models.py   <- Intern 5 (schema, owned + reviewed by all)
  migrations/     <- Intern 5 (Alembic DDL scripts)
  tests/          <- everyone adds tests for their own routers/services
  docs/           <- Intern 5 (ER diagram, this file, deployment notes)
  frontend/       <- Intern 1 (separate folder, own package.json - not built yet)
```

## Branching strategy

- **`main`** — always in a working state. Protected: no direct pushes,
  only merges via reviewed PRs. This is what CI runs against and what
  gets demoed on Day 7.
- **`integration`** — shared branch where all five interns merge their
  work starting Day 4-5, ahead of merging into `main`. Catches
  cross-domain breakage (e.g. Intern 3's prediction format changing on
  Intern 4) before it hits `main`.
- **Feature branches** — one per intern per task, named:
  ```
  <intern-number>-<short-description>
  e.g. intern2-jwt-auth, intern3-mediapipe-landmarks, intern4-assessment-scoring
  ```

## Day-by-day flow

| Day | What happens |
|-----|--------------|
| 1 | Everyone works on `main` directly (scaffolding only, low conflict risk) |
| 2-5 | Each intern works on their own feature branch, opens a PR into `integration` when a task is done |
| 4 (evening) | Mid-week mini-integration check per SRS Section 7.2 — merge what's ready into `integration`, resolve conflicts together |
| 6 | All remaining feature branches merged into `integration`; `integration` merged into `main` once CI is green |
| 7 | Only bugfix commits directly reviewed and merged into `main` — no new features (per SRS Section 8, "no new feature work should start on this day") |

## Commit message convention

```
<intern-tag>: <short imperative description>

e.g.
intern2: add JWT token generation and RBAC dependency
intern3: wire MediaPipe hand landmark extraction
intern5: add Alembic migration for assessments table
```

Keeps `git log` scannable by domain, which matters since Milestone 2
hands this repo off and reviewers need to trace who owns what.

## Pull request checklist (before merging into `integration` or `main`)

- [ ] `pytest tests/` passes locally
- [ ] `ruff check app tests` passes locally
- [ ] If you changed `app/models.py`, you generated a new Alembic
      migration (`alembic revision --autogenerate -m "..."`) and
      tested `alembic upgrade head` runs cleanly
- [ ] No secrets (API keys, passwords) committed — check `.env` is
      still gitignored
- [ ] PR description states which SRS requirement ID (FR-1 through
      FR-5) this addresses

## CI stub

`.github/workflows/ci.yml` runs automatically on every push/PR to any
branch: lint (`ruff`) → test (`pytest` with coverage) → Docker build
validation. This satisfies the SRS's "basic CI check (lint/build on
push)" requirement. See the file itself for the exact steps.
