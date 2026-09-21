-- Вложенные папки документов.
--
-- Материалы самооценки раскладываются по восьми разделам приказа, а внутри —
-- по учебным годам. Одноуровневые папки превращали это в три десятка папок
-- подряд с названиями вида «IV. 2024 - 2025».

ALTER TABLE "DocumentFolder" ADD COLUMN "parentId" TEXT;

CREATE INDEX "DocumentFolder_tenantId_parentId_position_idx" ON "DocumentFolder"("tenantId", "parentId", "position");

ALTER TABLE "DocumentFolder" ADD CONSTRAINT "DocumentFolder_parentId_fkey"
    FOREIGN KEY ("parentId") REFERENCES "DocumentFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
