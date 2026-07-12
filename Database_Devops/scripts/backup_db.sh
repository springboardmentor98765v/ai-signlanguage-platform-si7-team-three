#!/usr/bin/env bash
#
# backup_db.sh - Backup & Disaster Recovery script
# (PDF Infrastructure Layer: "Backup & Disaster Recovery")
#
# Usage:
#   ./scripts/backup_db.sh              # backup SQLite dev DB
#   DATABASE_URL=postgresql://...       # (future) extend this script
#                                          for pg_dump when Postgres is used
#
# Keeps the last 7 backups and deletes older ones to avoid unbounded
# disk growth - adjust RETENTION_COUNT as needed.

set -euo pipefail

DB_FILE="${SLP_DB_FILE:-sign_language_platform.db}"
BACKUP_DIR="${SLP_BACKUP_DIR:-backups}"
RETENTION_COUNT=7
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

mkdir -p "$BACKUP_DIR"

if [ ! -f "$DB_FILE" ]; then
    echo "ERROR: Database file '$DB_FILE' not found. Nothing to back up."
    exit 1
fi

BACKUP_PATH="$BACKUP_DIR/sign_language_platform_${TIMESTAMP}.db"
cp "$DB_FILE" "$BACKUP_PATH"
echo "Backup created: $BACKUP_PATH"

# Prune old backups beyond retention count
cd "$BACKUP_DIR"
ls -1t sign_language_platform_*.db 2>/dev/null | tail -n +$((RETENTION_COUNT + 1)) | xargs -r rm --
echo "Retention enforced: keeping the $RETENTION_COUNT most recent backups."

echo "Done."
