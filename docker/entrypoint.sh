#!/bin/sh
# Применяем миграции БД перед каждым запуском контейнера — это безопасно,
# так как drizzle-kit migrate идемпотентен (уже применённые миграции
# пропускаются). Это гарантирует, что схема БД всегда соответствует коду
# после `docker compose up`, без отдельного ручного шага.
set -e

echo "Applying database migrations..."
npm run db:migrate

echo "Starting application..."
exec "$@"
