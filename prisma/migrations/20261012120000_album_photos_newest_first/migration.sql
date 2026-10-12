-- Фото в альбоме — новые первыми, как в новостях (решение владельца 12.10.2026).
-- Раньше новое фото вставало в конец альбома; теперь загрузка ставит его
-- в начало, а здесь уже загруженные переставляются по дате загрузки,
-- от новых к старым. Сад 33nursat не трогаем — его содержимое не меняем.
UPDATE "AlbumItem" AS ai
SET "position" = ranked.rn - 1
FROM (
  SELECT
    item."id",
    row_number() OVER (
      PARTITION BY item."albumId"
      ORDER BY media."createdAt" DESC, item."position" DESC, item."id" DESC
    ) AS rn
  FROM "AlbumItem" AS item
  JOIN "Media" AS media ON media."id" = item."mediaId"
  JOIN "Album" AS album ON album."id" = item."albumId"
  JOIN "Tenant" AS tenant ON tenant."id" = album."tenantId"
  WHERE tenant."slug" <> '33nursat'
) AS ranked
WHERE ai."id" = ranked."id";
