-- Индексы и объекты БД, которые не выражаются через drizzle-kit (кастомные
-- operator classes). Выполняется после каждого прогона миграций —
-- все операторы идемпотентны, поэтому повторный запуск безопасен.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS materials_name_trgm_idx
  ON materials USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS suppliers_name_trgm_idx
  ON suppliers USING gin (name gin_trgm_ops);
