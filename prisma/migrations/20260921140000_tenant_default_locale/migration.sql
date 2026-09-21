-- Язык, на котором сайт сада открывается без ?lang=. Изначально казахский,
-- русский посетитель переключает кнопкой РУС. Сад может выбрать и русский.

ALTER TABLE "Tenant" ADD COLUMN "defaultLocale" TEXT NOT NULL DEFAULT 'kk';
