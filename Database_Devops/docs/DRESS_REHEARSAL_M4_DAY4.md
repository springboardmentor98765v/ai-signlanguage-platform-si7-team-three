# Production Dress Rehearsal (Milestone 4, Day 4)

**Owner:** Intern 5 (Database & DevOps)
**SRS deliverable:** Day 4 — "Full production stack started locally with one command. Complete user journey tested against this local 'production-like' setup. Any issues found are fixed before deployment day."

## Setup

```bash
cp .env.production.example .env.production
# fill in real production values (Supabase pooler connection, new secret key)
docker compose -f docker-compose.prod.yml --env-file .env.production up --build
```

## Result

Both services started successfully:
- `slp_backend_prod` — connected to live Supabase production database, health check passing
- `slp_ai_service_prod` — health check passing

## Issue found and fixed

Initial attempt failed with `could not translate host name
"aws-X-region.pooler.supabase.com"` - the `.env.production` file still
had unfilled placeholder values from `.env.production.example`
(`PROJECT_REF`, password, and region were not yet substituted with
real values). Fixed by filling in the real Supabase pooler connection
string. Documented here as a real lesson for Day 5's actual deployment
- easy mistake to make again if rushing.

## Full user journey test against this production-like stack

```bash
python -m scripts.docker_integration_test
```

Result: **Both integration journeys passed** - learner registration,
practice, real AI prediction, and analytics update; plus RBAC
enforcement - all confirmed working against the production database
configuration, not just local dev SQLite/test setup.

## Ready for Day 5

This confirms the backend + AI service + production database
combination works correctly. Day 5 will deploy this exact
configuration to Render (already proven working there in Milestone 2).