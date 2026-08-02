# Deployment Readiness Checklist

**Owner:** Intern 5 (Database & QA)
**SRS deliverable:** Milestone 3, Day 9 — "Deployment Readiness Checklist document created. Checklist reviewed with the whole team. Checklist clearly marked as 'for Milestone 4 use.'"

> **This is a planning document only. No deployment work happens in
> Milestone 3** — this checklist is prepared now so Milestone 4 can
> move quickly, using real lessons learned from our Milestone 2 test
> deployment.

---

## Context: what we already learned in Milestone 2

We already did a real (test) deployment to Render in Milestone 2. This
checklist is written from that actual experience, not just theory —
several items below are things that genuinely went wrong and had to
be debugged.

---

## 1. Hosting & Environment

- [ ] **Choose final hosting provider** — Render (used in M2 testing),
      Railway, or Fly.io. Render worked, but confirm free-tier limits
      are still acceptable for a real launch (spin-down after
      inactivity on free tier is a real limitation to flag to the team).
- [ ] **Confirm org-level GitHub permissions are resolved** — in M2,
      Render couldn't access our team's GitHub org because no one had
      admin rights to approve the GitHub App. This must be sorted
      *before* Milestone 4 starts, not discovered mid-deployment again.
- [ ] **Set Root Directory correctly** — our backend lives in
      `Database_Devops/`, not the repo root. This must be explicitly
      configured in the hosting provider's settings (we missed this
      once and had to fix it).

## 2. Database

- [ ] **Use the Session Pooler connection string, NOT Direct
      connection** — direct connections failed to resolve from
      Render's servers in M2 (`could not translate host name`). Always
      use the pooler format: `postgres.PROJECT_REF@aws-X-region.pooler.supabase.com:6543`
- [ ] **Use a password with NO special characters** — special
      characters (`@`, `#`, etc.) in the database password broke URL
      parsing twice during M2 setup, even when we thought we'd encoded
      them correctly. Simplest fix: reset to an alphanumeric-only
      password before the real launch.
- [ ] **Confirm Supabase project won't auto-pause** — free tier
      Supabase projects pause after inactivity (we hit this once mid-M2).
      Decide whether to upgrade, or accept the risk that the demo/production
      instance might need manual "resume" occasionally.
- [ ] **Run `alembic upgrade head` against production DB before going live**
- [ ] **Take a fresh backup immediately before going live** (see backup
      script: `scripts/backup_postgres.sh`)

## 3. Environment Variables & Secrets

- [ ] **Every secret lives in the hosting provider's environment
      variable settings, never hardcoded** — confirmed pattern from
      `.env.example`
- [ ] **Generate a NEW, unique `SLP_SECRET_KEY` for production** — do
      not reuse the local development one
- [ ] **Double-check no placeholder values remain** — in M2 we
      accidentally deployed with the literal text "your real Supabase
      connection string" still in the field instead of the actual
      value. Always verify the deployed environment variables show
      real values, not example/placeholder text.
- [ ] **Set real SMTP credentials** if email-based password reset is
      going live (currently `SMTP_ENABLED=false` in dev)

## 4. Docker & Build

- [ ] **Confirm `Dockerfile` and `Dockerfile.ai` both build cleanly**
      on the hosting provider (already verified working on Render in M2)
- [ ] **Confirm `docker-compose.yml` syntax is valid** — run
      `docker compose config` locally before any deployment-related
      change (we hit a real YAML indentation bug that broke the whole
      file)
- [ ] **Decide: does the AI service deploy as a genuinely separate
      container calling the backend over HTTP, or stay in-process?**
      Currently in-process for simplicity (see `docs/DEPLOYMENT_NOTE.md`)
      — this decision should be finalized before Milestone 4.

## 5. Testing Before Go-Live

- [ ] **All 60+ automated tests passing** (`pytest tests/ -v`)
- [ ] **Docker integration tests passing** (`python -m scripts.docker_integration_test`)
- [ ] **Data integrity check clean** (`python -m scripts.check_data_integrity`)
- [ ] **Health check endpoint (`/health`) confirmed reachable** from
      outside the container/network, not just locally
- [ ] **Load test run against the real (not local) deployed instance**,
      not just localhost, since network latency changes results

## 6. Monitoring & Reliability

- [ ] **UptimeRobot monitor pointed at the real production URL** (not
      the test one from M2)
- [ ] **Confirm backup script (`scripts/backup_postgres.sh`) is run on
      a schedule**, not just manually — decide who owns this and how
      often (daily recommended per M2's SRS)
- [ ] **Decide on-call/response plan**: who gets notified if UptimeRobot
      reports the site down?

## 7. Team Coordination

- [ ] **Resolve the two-backend situation** (see team discussion re:
      `Database_Devops/app/` vs `Backend/app/`) — must be a single,
      agreed backend before real deployment, not two parallel versions
- [ ] **Confirm Frontend is pointed at the correct backend URL**
      (production, not localhost) before go-live
- [ ] **Final review with mentor** before Milestone 4 deployment begins

---

## Summary

This checklist exists so Milestone 4 doesn't have to rediscover the
same problems Milestone 2 already solved. Every item marked with a
past-tense explanation ("we hit this," "this broke") is a genuine
issue encountered and fixed during real testing, not a hypothetical
concern.

**Status: ready for team review. No deployment action taken in Milestone 3.**