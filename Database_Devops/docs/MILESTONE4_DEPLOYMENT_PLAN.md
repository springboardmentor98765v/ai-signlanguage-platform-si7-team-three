# Milestone 4 — Final Deployment Plan (Day 1)

**Owner:** Intern 5 (Database & DevOps)
**SRS deliverable:** Day 1 — "Milestone 3 Deployment Readiness Checklist reviewed. Final choice of free hosting confirmed for DB, backend, AI service, frontend. List of new database tables written and shared with Intern 2 and Intern 4."

## Reviewing the Milestone 3 checklist

See `docs/DEPLOYMENT_READINESS_CHECKLIST.md` - written from real Milestone 2
deployment experience. Confirming each item still applies:

- ✅ Session pooler connection string requirement - still applies
- ✅ Alphanumeric-only database password - still applies (already reset once)
- ✅ Root Directory = `Database_Devops` setting - still applies
- ✅ Docker Compose YAML indentation care - still applies (hit this bug twice)
- ⚠️ Org GitHub permissions issue - **still unresolved**; deploying from personal
  fork (`Monisha-Magesh/...`) worked as a workaround in M2, will reuse the same
  approach unless resolved by the team before Day 5-6

## Final hosting choices (confirmed)

| Component | Service | Status |
|---|---|---|
| Database | Supabase (PostgreSQL) | ✅ Already live since Milestone 2 |
| Backend | Render (free tier) | ✅ Already live since Milestone 2 (via personal fork) |
| AI Service | Render (free tier), same account | To be deployed alongside backend, Day 5-6 |
| Frontend | Netlify or Vercel | To be decided with Intern 1, Day 6 |
| Uptime monitoring | UptimeRobot | ✅ Already set up in Milestone 2 |

## New database tables needed

| Table | Why | Needed by |
|---|---|---|
| `certification_exams` | FR-4: formal exam results across 4 levels (Beginner/Intermediate/Advanced/Professional), separate from regular practice sessions | Intern 4 (Day 2) |
| `trainer_learners` | FR-1, FR-2: links an Accessibility Trainer to the learners they oversee, same pattern as `instructor_students` from Milestone 2 | Intern 2 (Day 2), Intern 1 (Day 2-3) |

## Design note shared with Intern 2 and Intern 4

`certification_exams` will store: learner, level attempted, signs tested
(as a list), overall score, pass/fail, and a link to the resulting
certificate if passed - reusing the existing `Certificate` table rather
than duplicating certificate data.

`trainer_learners` follows the exact same one-trainer-per-learner
pattern as `instructor_students` (Milestone 2) for consistency, unless
the team decides otherwise before Day 2.

## Known risk carried into this milestone

The two-backend situation (this project's `Database_Devops/app/` vs.
`Backend/app/`) remains unresolved as of this writing. This must be
addressed before Day 5 deployment, since deploying two disconnected
backends would not satisfy FR-2/FR-5's "fully deployed live" requirement
meaningfully.