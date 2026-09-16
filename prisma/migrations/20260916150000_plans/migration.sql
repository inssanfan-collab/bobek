-- Два тарифа: BASIC — сад наполняет сайт сам, MANAGED — наполняем мы по запросу.
-- Всё, что было оформлено раньше, оформлялось по единственному тарифу — базовому.
ALTER TABLE "Subscription" ADD COLUMN "plan" TEXT NOT NULL DEFAULT 'BASIC';
ALTER TABLE "Contract" ADD COLUMN "plan" TEXT NOT NULL DEFAULT 'BASIC';
ALTER TABLE "Lead" ADD COLUMN "plan" TEXT;
