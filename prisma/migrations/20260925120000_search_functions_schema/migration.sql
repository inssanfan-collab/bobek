-- Функции поиска — со схемой в вызовах.
--
-- При восстановлении копии pg_restore ставит пустой search_path (так он
-- защищается от подмены функций). Вызов bobegim_plain_text без «public.»
-- внутри bobegim_tsv тогда не находится, и таблицы с колонкой searchVector
-- (Post, Page, Section, Document, StaffMember, TenantProfile) не создаются —
-- копия базы не восстанавливалась. Результат функции не меняется, поэтому
-- пересчитывать сохранённые векторы не нужно.

CREATE OR REPLACE FUNCTION public.bobegim_tsv(txt text, weight "char") RETURNS tsvector
  LANGUAGE sql IMMUTABLE PARALLEL SAFE AS
$$
  SELECT setweight(to_tsvector('russian', public.bobegim_plain_text(txt)), weight)
      || setweight(to_tsvector('simple',  public.bobegim_plain_text(txt)), weight)
$$;
