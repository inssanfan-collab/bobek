#!/usr/bin/env bash
# Резервная копия базы и загруженных файлов.
# Ставится в cron: 0 3 * * * /opt/bobegim/deploy/backup.sh >> /var/log/bobegim-backup.log 2>&1
set -euo pipefail

cd "$(dirname "$0")/.."

BACKUP_DIR="${BACKUP_DIR:-./backups}"
KEEP_DAYS="${KEEP_DAYS:-14}"
STAMP=$(date +%Y-%m-%d_%H-%M)

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Копия базы"
docker compose exec -T postgres pg_dump -U "${POSTGRES_USER:-bobegim}" "${POSTGRES_DB:-bobegim}" \
  | gzip > "$BACKUP_DIR/db_$STAMP.sql.gz"

echo "[$(date)] Копия файлов садов"
docker compose run --rm -T app tar -cz -C /app storage \
  > "$BACKUP_DIR/storage_$STAMP.tar.gz"

echo "[$(date)] Удаляем копии старше $KEEP_DAYS дней"
find "$BACKUP_DIR" -name '*.gz' -mtime "+$KEEP_DAYS" -delete

echo "[$(date)] Готово. Занято: $(du -sh "$BACKUP_DIR" | cut -f1)"
