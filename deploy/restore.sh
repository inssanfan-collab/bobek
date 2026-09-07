#!/usr/bin/env bash
# Восстановление из копии. Проверяйте его хотя бы раз в месяц:
# непроверенная резервная копия — это не резервная копия.
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Использование: $0 backups/db_2026-09-07_03-00.sql.gz [backups/storage_....tar.gz]"
  exit 1
fi

cd "$(dirname "$0")/.."

echo "ВНИМАНИЕ: текущая база будет заменена содержимым $1"
read -r -p "Продолжить? [yes/NO] " answer
[ "$answer" = "yes" ] || { echo "Отменено"; exit 1; }

gunzip -c "$1" | docker compose exec -T postgres psql -U "${POSTGRES_USER:-bobegim}" -d "${POSTGRES_DB:-bobegim}"

if [ $# -ge 2 ]; then
  docker compose run --rm -T app tar -xz -C /app < "$2"
fi

docker compose restart app
echo "Готово."
