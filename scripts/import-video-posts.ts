/**
 * Наполнение раздела новостей роликами сада.
 *
 * Сады ведут Instagram, а сайт при подключении стоит пустым. Скрипт берёт
 * готовый список роликов и заводит по новости на каждый: ссылка на ролик,
 * обложка и текст на двух языках. Перевод скрипт не выдумывает — обе версии
 * приходят в файле, иначе на сайте оказался бы машинный русский рядом
 * с живым казахским.
 *
 * Запуск:
 *   pnpm tsx scripts/import-video-posts.ts <домен сада> <файл.json>
 *
 * Формат файла: { "posts": [ { "url", "date", "titleKk", "titleRu",
 *                              "bodyKk", "bodyRu", "coverUrl" } ] }
 *
 * Повторный запуск ничего не портит: запись с такой же ссылкой на ролик
 * пропускается.
 */
import { promises as fs } from 'node:fs';
import { prisma } from '../src/server/db';
import { saveUpload } from '../src/server/media';
import { parseVideo } from '../src/lib/video';
import { slugify } from '../src/lib/slug';

type Incoming = {
  url: string;
  date: string;
  titleKk: string;
  titleRu: string;
  bodyKk?: string;
  bodyRu?: string;
  /** Обложка у сервиса: Instagram отдаёт её только по прямой ссылке со страницы поста. */
  coverUrl?: string;
};

async function fetchCover(url: string, tenantId: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`  обложка не скачалась: ${response.status}`);
      return null;
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    const type = response.headers.get('content-type') ?? 'image/jpeg';
    const file = new File([buffer], 'cover.jpg', { type });
    const media = await saveUpload(file, tenantId);
    return media.id;
  } catch (error) {
    console.warn('  обложка не скачалась:', (error as Error).message);
    return null;
  }
}

async function main() {
  const [host, jsonPath] = process.argv.slice(2);
  if (!host || !jsonPath) {
    console.error('Укажите домен сада и файл: pnpm tsx scripts/import-video-posts.ts sad.edusad.kz posts.json');
    process.exit(1);
  }

  const domain = await prisma.domain.findUnique({ where: { host }, include: { tenant: true } });
  if (!domain) throw new Error(`Сад с доменом ${host} не найден`);

  const section = await prisma.section.findFirst({
    where: { tenantId: domain.tenantId, type: 'NEWS' },
  });
  if (!section) throw new Error('У сада нет раздела новостей');

  const raw = JSON.parse(await fs.readFile(jsonPath, 'utf8')) as { posts: Incoming[] };

  for (const item of raw.posts) {
    const video = parseVideo(item.url);
    if (!video) {
      console.warn(`✗ ${item.url} — не ссылка на YouTube или Instagram, пропущено`);
      continue;
    }

    const exists = await prisma.post.findFirst({
      where: { tenantId: domain.tenantId, videoUrl: video.pageUrl },
      select: { id: true },
    });
    if (exists) {
      console.log(`• ${item.titleRu} — уже есть, пропущено`);
      continue;
    }

    const coverMediaId = item.coverUrl ? await fetchCover(item.coverUrl, domain.tenantId) : null;

    // Ролики выходят по нескольку в день, и заголовки у них повторяются —
    // поэтому к адресу добавляется код ролика.
    const slug = `${slugify(item.titleRu).slice(0, 60)}-${video.id.toLowerCase()}`;

    await prisma.post.create({
      data: {
        tenantId: domain.tenantId,
        sectionId: section.id,
        slug,
        titleKk: item.titleKk,
        titleRu: item.titleRu,
        bodyKk: item.bodyKk ? `<p>${item.bodyKk.replace(/\n/g, '</p><p>')}</p>` : null,
        bodyRu: item.bodyRu ? `<p>${item.bodyRu.replace(/\n/g, '</p><p>')}</p>` : null,
        excerptKk: item.bodyKk?.split('\n')[0] ?? null,
        excerptRu: item.bodyRu?.split('\n')[0] ?? null,
        videoUrl: video.pageUrl,
        coverMediaId,
        status: 'PUBLISHED',
        publishedAt: new Date(item.date),
      },
    });

    console.log(`✓ ${item.titleRu}${coverMediaId ? '' : ' (без обложки)'}`);
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
