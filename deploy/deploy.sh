#!/usr/bin/env bash
# Обновление боевого сервера. Запускать из каталога проекта на VPS.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "→ Забираем изменения"
git pull --ff-only

echo "→ Резервная копия базы перед миграцией"
./deploy/backup.sh

echo "→ Пересобираем приложение"
docker compose build app

echo "→ Применяем миграции"
docker compose run --rm app pnpm exec prisma migrate deploy

echo "→ Перезапускаем"
docker compose up -d

echo "→ Ждём готовности"
for i in $(seq 1 30); do
  if docker compose exec -T app node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"; then
    echo "✓ Приложение отвечает"
    exit 0
  fi
  sleep 2
done

echo "✗ Приложение не поднялось. Логи:"
docker compose logs --tail 50 app
exit 1
