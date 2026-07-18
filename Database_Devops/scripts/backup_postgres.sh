#!/usr/bin/env bash
#
# backup_postgres.sh - Backup script for the Supabase/Postgres cloud database
# (PDF Infrastructure Layer: "Backup & Disaster Recovery", Milestone 2 Day 6)
#
# Usage:
#   ./scripts/backup_postgres.sh
#
# Requires DATABASE_URL to be set in your .env file, pointing at your
# Supabase (or other Postgres) connection string.
#
# Keeps the last 7 backups and deletes older ones automatically.

set -euo pipefail

if [ -z "${DATABASE_URL:-}" ] && [ -f .env ]; then
    set -a
    source .env
    set +a
fi

if [ -z "${DATABASE_URL:-}" ]; then
    echo "ERROR: DATABASE_URL is not set. Add it to your .env file first."
    exit 1
fi

BACKUP_DIR="${SLP_BACKUP_DIR:-backups}"
RETENTION_COUNT=7
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

mkdir -p "$BACKUP_DIR"

BACKUP_PATH="$BACKUP_DIR/supabase_backup_${TIMESTAMP}.sql"

echo "Backing up database to $BACKUP_PATH ..."
pg_dump --schema=public --no-owner --no-privileges "$DATABASE_URL" > "$BACKUP_PATH"
echo "Backup created: $BACKUP_PATH"

cd "$BACKUP_DIR"
ls -1t supabase_backup_*.sql 2>/dev/null | tail -n +$((RETENTION_COUNT + 1)) | xargs -r rm --
echo "Retention enforced: keeping the $RETENTION_COUNT most recent backups."

echo "Done."