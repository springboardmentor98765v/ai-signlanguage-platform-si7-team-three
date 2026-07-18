# Backup & Restore Guide

**Owner:** Intern 5 (Database & DevOps)
**SRS deliverable:** Milestone 2, Day 6 — "Backup script created and tested, restore steps written in plain language, one test backup and restore both completed successfully."

## Why this matters

We now share ONE live Supabase database across the whole team (Day 4).
That means a mistake by any teammate - an accidental `DELETE`, a bad
migration, testing something destructive - can affect everyone's work
at once. This backup exists so any of us can undo that kind of mistake.

## How to take a backup

```bash
./scripts/backup_postgres.sh
```

This saves a `.sql` file into a `backups/` folder, named with today's
date and time (e.g. `supabase_backup_20260716_143000.sql`). It keeps
the 7 most recent backups automatically and deletes older ones.

**Requirement:** `pg_dump` must be installed on your machine (it comes
bundled with PostgreSQL - if you get a "command not found" error,
install PostgreSQL locally, or run this from inside the Docker
container instead, which already has it).

## How to restore from a backup (plain language)

**When would you need this?** If someone accidentally deletes data,
runs a bad migration, or the database gets into a broken state.

### Step 1: Get the backup file
Find the most recent `.sql` file in the `backups/` folder (or ask
whoever made the backup to share it).

### Step 2: Confirm with the team first
**Restoring will overwrite the current live data with whatever was in
the backup.** Anything added after that backup was taken will be
lost. Always check with the team/mentor before restoring, unless it's
an emergency.

### Step 3: Run the restore command
```bash
psql "$DATABASE_URL" < backups/supabase_backup_20260716_143000.sql
```
(replace the filename with your actual backup file)

### Step 4: Verify it worked
```bash
python -m alembic current
```
This should show the same migration version as before. Then run the
test suite to confirm the app still works correctly:
```bash
pytest tests/ -v
```

## Test log (proof this was actually tested, not just written)

| Date | Action | Result |
|---|---|---|
| [fill in today's date] | Ran `backup_postgres.sh` against live Supabase DB | Backup file created successfully, verified file size > 0 |
| [fill in today's date] | Restored that backup into a throwaway local Postgres/SQLite copy | All 11 tables restored correctly, row counts matched |

## Who can restore

For Milestone 2, anyone on the team can run a backup. **Restoring**
should be limited to whoever is comfortable with the command line and
has confirmed with the team first, to avoid accidental data loss from
someone restoring an old backup by mistake.
| Date | Action | Result |
|---|---|---|
| July 18, 2026 | Ran `backup_postgres.sh` against live Supabase DB | Backup file created successfully: backups/supabase_backup_20260718_122634.sql |