-- Какая часть обложки важна: на телефоне широкое фото обрезается
-- до узкой середины, и сад без этой настройки ничего не может сделать.
ALTER TABLE "TenantProfile" ADD COLUMN "coverFocus" TEXT NOT NULL DEFAULT 'center';
