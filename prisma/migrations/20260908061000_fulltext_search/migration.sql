-- Полнотекстовый поиск по сайту сада и по каталогу портала.
--
-- Словаря казахского языка в PostgreSQL нет, поэтому текст индексируется дважды:
-- конфигурацией russian (приводит русские словоформы к основе) и simple
-- (оставляет слово как есть). Русский запрос находится по основе, казахский —
-- по началу слова: в поисковый tsquery добавляется префикс `:*`.

-- Текст без HTML: иначе в индекс попадают «p», «div», «nbsp» — по ним начинает
-- находиться каждая страница сада.
CREATE OR REPLACE FUNCTION bobegim_plain_text(html text) RETURNS text
  LANGUAGE sql IMMUTABLE PARALLEL SAFE AS
$$
  SELECT regexp_replace(
           regexp_replace(coalesce(html, ''), '<[^>]*>', ' ', 'g'),
           '&[a-zA-Z]+;|&#[0-9]+;', ' ', 'g')
$$;

-- Двуязычный вектор одного куска текста с весом: A — заголовок, B — краткое
-- описание, C — тело. Веса разводят по релевантности совпадение в заголовке
-- и упоминание в середине статьи.
CREATE OR REPLACE FUNCTION bobegim_tsv(txt text, weight "char") RETURNS tsvector
  LANGUAGE sql IMMUTABLE PARALLEL SAFE AS
$$
  SELECT setweight(to_tsvector('russian', bobegim_plain_text(txt)), weight)
      || setweight(to_tsvector('simple',  bobegim_plain_text(txt)), weight)
$$;

ALTER TABLE "Post" ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (
       bobegim_tsv(coalesce("titleRu", '')   || ' ' || coalesce("titleKk", ''),   'A')
    || bobegim_tsv(coalesce("excerptRu", '') || ' ' || coalesce("excerptKk", ''), 'B')
    || bobegim_tsv(coalesce("bodyRu", '')    || ' ' || coalesce("bodyKk", ''),    'C')
  ) STORED;

ALTER TABLE "Page" ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (
    bobegim_tsv(coalesce("bodyRu", '') || ' ' || coalesce("bodyKk", ''), 'C')
  ) STORED;

-- Заголовок страницы живёт в разделе, поэтому раздел индексируется отдельно:
-- поиск по названию раздела должен приводить на саму страницу.
ALTER TABLE "Section" ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (
    bobegim_tsv(coalesce("titleRu", '') || ' ' || coalesce("titleKk", ''), 'A')
  ) STORED;

ALTER TABLE "Document" ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (
    bobegim_tsv(coalesce("titleRu", '') || ' ' || coalesce("titleKk", ''), 'A')
  ) STORED;

ALTER TABLE "StaffMember" ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (
       bobegim_tsv(coalesce("fullName", ''), 'A')
    || bobegim_tsv(coalesce("positionRu", '')  || ' ' || coalesce("positionKk", ''),  'B')
    || bobegim_tsv(coalesce("educationRu", '') || ' ' || coalesce("educationKk", ''), 'C')
  ) STORED;

-- Каталог портала: родитель ищет сад по названию, адресу или району.
ALTER TABLE "TenantProfile" ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (
       bobegim_tsv(coalesce("nameRu", '')      || ' ' || coalesce("nameKk", '') || ' ' ||
                   coalesce("shortNameRu", '') || ' ' || coalesce("shortNameKk", ''), 'A')
    || bobegim_tsv(coalesce("addressRu", '')   || ' ' || coalesce("addressKk", '') || ' ' ||
                   coalesce("district", ''), 'B')
    || bobegim_tsv(coalesce("aboutRu", '')     || ' ' || coalesce("aboutKk", ''), 'C')
  ) STORED;

CREATE INDEX "Post_searchVector_idx" ON "Post" USING GIN ("searchVector");
CREATE INDEX "Page_searchVector_idx" ON "Page" USING GIN ("searchVector");
CREATE INDEX "Section_searchVector_idx" ON "Section" USING GIN ("searchVector");
CREATE INDEX "Document_searchVector_idx" ON "Document" USING GIN ("searchVector");
CREATE INDEX "StaffMember_searchVector_idx" ON "StaffMember" USING GIN ("searchVector");
CREATE INDEX "TenantProfile_searchVector_idx" ON "TenantProfile" USING GIN ("searchVector");
