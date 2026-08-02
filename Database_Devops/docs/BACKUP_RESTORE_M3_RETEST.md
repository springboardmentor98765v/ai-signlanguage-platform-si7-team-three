# Backup & Restore Re-test (Milestone 3, Day 5)

**Owner:** Intern 5 (Database & QA)
**SRS deliverable:** Milestone 3, Day 5 — "Backup taken of the current, larger database. Restore tested successfully from that backup. Any issues with backup/restore fixed."

## Why re-test

The database has grown significantly since Milestone 2's original
backup/restore test: 3 new tables (Notifications, Badges, Streaks),
new indexes, and real merged data from multiple teammates. This
confirms the process from `docs/BACKUP_AND_RESTORE.md` still works
correctly at the current scale.

## Test performed

1. Ran `./scripts/backup_postgres.sh` against the live Supabase database
2. Backup created: `backups/supabase_backup_20260801_110015.sql` (31,169 bytes)
3. Confirmed backup contains all 14 real tables (via `CREATE TABLE` search),
   including the new Milestone 3 tables: `badges`, `notifications`, `streaks`
4. Restored into a throwaway local Postgres database (`test_restore_m3`)
5. Verified with `\dt` - all 14 tables present, plus all indexes and
   sequences restored correctly
6. Cleaned up: dropped the test database afterward

## Result: Successful, no issues found

The backup/restore process from Milestone 2 continues to work
correctly with the larger Milestone 3 schema - no changes needed to
`scripts/backup_postgres.sh` itself.

## One minor, expected note

Running the restore produces a harmless message:
`ERROR: schema "public" already exists` - this happens because
`createdb` creates the default `public` schema automatically, and the
backup file also tries to create it. This does not affect the restore;
every table, index, and constraint after that line was created
successfully. Not something to fix - just worth knowing it's expected
and not a real error.