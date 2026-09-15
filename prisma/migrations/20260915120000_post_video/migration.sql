-- Ссылка на ролик в YouTube или Instagram. Своё видео на сервере не храним:
-- один ролик с утренника весит больше, чем весь сайт сада.
ALTER TABLE "Post" ADD COLUMN "videoUrl" TEXT;
