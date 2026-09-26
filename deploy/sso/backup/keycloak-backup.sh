#!/usr/bin/env bash
# Daily logical backup of the Keycloak database (container dts-sso-db).
#   output : $BACKUP_DIR/keycloak-<YYYYmmdd-HHMMSS>.dump  (pg_dump custom format)
#   verify : pg_restore --list must succeed and the dump must be non-trivial
#   retain : newest $KEEP dumps
# Exit non-zero on any failure so systemd marks the run as failed.
set -euo pipefail

CONTAINER="${CONTAINER:-dts-sso-db}"
DB="${DB:-keycloak}"
DB_USER="${DB_USER:-keycloak}"
BACKUP_DIR="${BACKUP_DIR:-/data/backup/keycloak}"
KEEP="${KEEP:-14}"
MIN_BYTES=102400

log() { echo "[$(date '+%F %T')] $*"; }

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"
stamp=$(date +%Y%m%d-%H%M%S)
target="$BACKUP_DIR/keycloak-$stamp.dump"
tmp="$target.partial"

log "dumping $DB from $CONTAINER"
docker exec "$CONTAINER" pg_dump -U "$DB_USER" -d "$DB" --format=custom --compress=6 > "$tmp"

size=$(stat -c %s "$tmp")
if [ "$size" -lt "$MIN_BYTES" ]; then
  rm -f "$tmp"
  log "ERROR: dump too small ($size bytes)"
  exit 1
fi
if ! docker exec -i "$CONTAINER" pg_restore --list < "$tmp" > /dev/null; then
  rm -f "$tmp"
  log "ERROR: pg_restore --list failed, dump is not readable"
  exit 1
fi
mv "$tmp" "$target"
chmod 600 "$target"
log "ok: $target ($(du -h "$target" | cut -f1))"

# retention: keep newest $KEEP dumps
ls -1t "$BACKUP_DIR"/keycloak-*.dump | tail -n +"$((KEEP + 1))" | while read -r old; do
  rm -f "$old"
  log "pruned $old"
done
