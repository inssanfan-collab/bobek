-- Папки документов вместо девяти фиксированных категорий.
--
-- Список категорий собирался «по практике проверок», но у каждого сада набор
-- свой: самооценка, циклограммы, перспективные планы, работа медсестры.
-- Полторы сотни файлов подряд родитель не читает, поэтому сад заводит папки сам.

CREATE TABLE "DocumentFolder" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "titleKk" TEXT NOT NULL,
    "titleRu" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentFolder_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DocumentFolder_tenantId_position_idx" ON "DocumentFolder"("tenantId", "position");

ALTER TABLE "DocumentFolder" ADD CONSTRAINT "DocumentFolder_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Document" ADD COLUMN "folderId" TEXT;

-- Прежние категории превращаются в папки — но только те, которыми сад
-- действительно пользовался: пустые папки на сайте выглядели бы заброшенными.
INSERT INTO "DocumentFolder" ("id", "tenantId", "titleKk", "titleRu", "position")
SELECT
    gen_random_uuid()::text,
    src."tenantId",
    CASE src."category"
        WHEN 'CHARTER'        THEN 'Жарғы'
        WHEN 'LICENSE'        THEN 'Лицензия'
        WHEN 'ORDERS'         THEN 'Бұйрықтар'
        WHEN 'RULES'          THEN 'Қабылдау қағидалары'
        WHEN 'PROCUREMENT'    THEN 'Мемлекеттік сатып алулар'
        WHEN 'REPORTS'        THEN 'Есептер'
        WHEN 'TRUSTEE'        THEN 'Қамқоршылық кеңес'
        WHEN 'ANTICORRUPTION' THEN 'Сыбайлас жемқорлыққа қарсы іс-қимыл'
        ELSE 'Басқа құжаттар'
    END,
    CASE src."category"
        WHEN 'CHARTER'        THEN 'Устав'
        WHEN 'LICENSE'        THEN 'Лицензия'
        WHEN 'ORDERS'         THEN 'Приказы'
        WHEN 'RULES'          THEN 'Правила приёма'
        WHEN 'PROCUREMENT'    THEN 'Государственные закупки'
        WHEN 'REPORTS'        THEN 'Отчёты'
        WHEN 'TRUSTEE'        THEN 'Попечительский совет'
        WHEN 'ANTICORRUPTION' THEN 'Противодействие коррупции'
        ELSE 'Прочие документы'
    END,
    CASE src."category"
        WHEN 'CHARTER'        THEN 0
        WHEN 'LICENSE'        THEN 1
        WHEN 'ORDERS'         THEN 2
        WHEN 'RULES'          THEN 3
        WHEN 'PROCUREMENT'    THEN 4
        WHEN 'REPORTS'        THEN 5
        WHEN 'TRUSTEE'        THEN 6
        WHEN 'ANTICORRUPTION' THEN 7
        ELSE 8
    END
FROM (SELECT DISTINCT "tenantId", "category" FROM "Document") AS src;

-- Папок до этой миграции не существовало, поэтому совпадение по названию
-- внутри сада однозначно.
UPDATE "Document" AS doc
SET "folderId" = f."id"
FROM "DocumentFolder" AS f
WHERE f."tenantId" = doc."tenantId"
  AND f."position" = CASE doc."category"
        WHEN 'CHARTER'        THEN 0
        WHEN 'LICENSE'        THEN 1
        WHEN 'ORDERS'         THEN 2
        WHEN 'RULES'          THEN 3
        WHEN 'PROCUREMENT'    THEN 4
        WHEN 'REPORTS'        THEN 5
        WHEN 'TRUSTEE'        THEN 6
        WHEN 'ANTICORRUPTION' THEN 7
        ELSE 8
      END;

DROP INDEX "Document_tenantId_category_position_idx";

ALTER TABLE "Document" DROP COLUMN "category";

DROP TYPE "DocumentCategory";

CREATE INDEX "Document_tenantId_folderId_position_idx" ON "Document"("tenantId", "folderId", "position");

ALTER TABLE "Document" ADD CONSTRAINT "Document_folderId_fkey"
    FOREIGN KEY ("folderId") REFERENCES "DocumentFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
