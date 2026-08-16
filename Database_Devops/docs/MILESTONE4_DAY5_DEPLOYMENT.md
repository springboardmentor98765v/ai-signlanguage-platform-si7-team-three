# Milestone 4, Day 5 — Backend & AI Service Deployment

**Owner:** Intern 5 (Database & DevOps)
**SRS deliverable:** Day 5 — "Database confirmed live and production-ready. Backend deployed and reachable. AI service deployed and reachable. Backend, AI service and database confirmed talking to each other correctly."

## Live URLs

| Service | URL | Status |
|---|---|---|
| Database | Supabase (PostgreSQL) | ✅ Live, confirmed via `alembic current` |
| Backend | https://sign-language-platform-backend.onrender.com | ✅ Live, `/health` returns `{"status":"ok"}` |
| AI Service | https://sign-language-platform-ai-service.onrender.com | ✅ Live, `/health` returns `{"status":"ok","service":"ai-prediction"}` |

## Issues hit and fixed today

1. **Database password rotated twice** after accidental exposure during
   troubleshooting - updated in local `.env`, `.env.production`, and
   Render's backend environment variables each time.
2. **Trailing newline in Render's `DATABASE_URL` value** caused
   `database "postgres\n" does not exist` - fixed by re-entering the
   value cleanly without a stray line break at the end.
3. **AI service path duplication** (`Database_Devops/Database_Devops`)
   - caused by setting both "Root Directory" and repeating the same
   path in "Dockerfile Path"/"Build Context Directory". Fixed by making
   the latter two relative to Root Directory (`Dockerfile.ai` and `.`
   instead of repeating `Database_Devops/`).

## Verification

- Backend `/health` → 200 OK
- AI service `/health` → 200 OK
- Backend confirmed connected to live Supabase database (migrations applied, `alembic current` matches head)

## Not yet done (Day 6)

- Frontend not yet deployed or connected to these live services
- Backend and AI service not yet confirmed talking to EACH OTHER (currently AI logic runs in-process inside the backend, not as a separate HTTP call - see `docs/DEPLOYMENT_NOTE.md`)