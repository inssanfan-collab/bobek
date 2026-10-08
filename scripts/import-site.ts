/**
 * Перенос готового сайта сада (обычно — со старого конструктора вроде Tilda)
 * в сад на портале: профиль, разделы и меню, страницы, документы по папкам,
 * альбомы, педагоги, группы, кружки, частые вопросы, режим дня.
 *
 * Сам сайт разбирает не этот скрипт: описание переноса (manifest.json)
 * и файлы готовятся заранее, на компьютере, где старый сайт выкачан и
 * разобран (для каждого сайта свой разбор — у всех своя разметка). Здесь
 * только раскладка по базе — одна для любого переноса.
 *
 * Запуск (условие react-server обязательно — сохранение файлов server-only):
 *   node --conditions=react-server --import tsx scripts/import-site.ts <папка> [адрес сада]
 * В папке: manifest.json, files/ (документы), img/ (картинки). Адрес сада
 * вторым аргументом — вместо указанного в манифесте (проба на локальной базе).
 * Файлы больше обычного предела загрузки (MAX_UPLOAD_MB, 50 МБ) переносятся
 * целиком, если запустить с MAX_UPLOAD_MB побольше — предел садов не меняется.
 *
 * В тексте страниц картинки записаны как {{img:<файл>}} — скрипт загружает
 * файл и подставляет его адрес. Ссылки на документы — /doc/<id>, а id
 * документов приходят в манифесте: так ссылки внутри самих docx на другие
 * документы переписаны ещё до загрузки.
 *
 * Повторный запуск ничего не дублирует: документ с тем же id, альбом
 * с тем же адресом, педагог с тем же ФИО и т. п. пропускаются, текст
 * страниц перезаписывается. Оборванный перенос можно просто запустить снова.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Prisma, SectionType } from '@prisma/client';
import { prisma } from '../src/server/db';
import { saveUpload } from '../src/server/media';
import { sanitizeContent } from '../src/lib/sanitize';

type Doc = { id: string; titleRu: string; titleKk: string; folderId: string | null; file: string };
type Folder = { id: string; parentId: string | null; titleRu: string; titleKk: string; position: number };
type PageEntry = { slug: string; existing?: boolean; titleRu?: string; titleKk?: string; after?: string; type?: SectionType; bodyRu: string };
type Manifest = {
  host: string;
  profile: Record<string, unknown>;
  /** Логотип и обложка — файлы из img/. */
  profileImages?: { logo?: string | null; cover?: string | null };
  pages: PageEntry[];
  sections?: { type: SectionType; slug: string; titleRu: string; titleKk: string; after?: string }[];
  nest?: Record<string, string[]>;
  hideSections?: string[];
  folders: Folder[];
  documents: Doc[];
  albums: { slug: string; titleRu: string; titleKk: string; descRu?: string | null; photos: { img: string; altRu?: string | null }[] }[];
  staff: { fullName: string; positionRu: string; positionKk: string; experience?: string | null; categoryName?: string | null; educationRu?: string | null; photo?: string | null }[];
  groups: { nameRu: string; nameKk: string; ageFrom?: number; ageTo?: number; language: string }[];
  // photo у кружка не хранится: фото кружков — отдельным альбомом.
  clubs: { nameRu: string; nameKk: string; descRu?: string; photo?: string | null }[];
  faq: { questionRu: string; questionKk: string; answerRu?: string }[];
  routine: { time: string; titleRu: string; titleKk: string }[];
};

const MIME: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

const dir = process.argv[2];
if (!dir) {
  console.error('Укажите папку переноса: manifest.json, files/, img/');
  process.exit(1);
}

const failed: string[] = [];

async function upload(tenantId: string, file: string, name: string) {
  const buffer = await fs.readFile(file);
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const type = MIME[ext];
  if (!type) throw new Error(`неизвестный тип файла .${ext}`);
  return saveUpload(new File([new Uint8Array(buffer)], name, { type }), tenantId);
}

async function main() {
  const manifest = JSON.parse(await fs.readFile(path.join(dir, 'manifest.json'), 'utf8')) as Manifest;
  if (process.argv[3]) manifest.host = process.argv[3];
  const domain = await prisma.domain.findFirst({ where: { host: manifest.host }, include: { tenant: true } });
  if (!domain) throw new Error(`Сад с адресом ${manifest.host} не найден`);
  const tenantId = domain.tenantId;
  console.log(`Сад: ${domain.tenant.slug} (${manifest.host})`);

  // ── картинки: каждая загружается один раз ──
  const imageIds = new Map<string, string>();
  const image = async (name: string, alt?: string | null) => {
    const known = imageIds.get(name);
    if (known) return known;
    const media = await upload(tenantId, path.join(dir, 'img', name), name.replace(/^tild[\w-]+__/, ''));
    if (alt) await prisma.media.update({ where: { id: media.id }, data: { altRu: alt } });
    imageIds.set(name, media.id);
    return media.id;
  };

  // ── профиль ──
  await prisma.tenantProfile.update({ where: { tenantId }, data: manifest.profile as Prisma.TenantProfileUpdateInput });
  const current = await prisma.tenantProfile.findUnique({ where: { tenantId }, select: { logoMediaId: true, coverMediaId: true } });
  const { logo, cover } = manifest.profileImages ?? {};
  // Свои логотип и обложку, если сад их уже поставил, не трогаем.
  if (logo && !current?.logoMediaId) await prisma.tenantProfile.update({ where: { tenantId }, data: { logoMediaId: await image(logo) } });
  if (cover && !current?.coverMediaId) await prisma.tenantProfile.update({ where: { tenantId }, data: { coverMediaId: await image(cover) } });
  console.log('профиль обновлён');

  // ── папки и документы: id заданы в манифесте — на них уже ссылаются
  // страницы и сами документы (/documents?folder=<id>, /doc/<id>) ──
  for (const folder of manifest.folders) {
    if (await prisma.documentFolder.findUnique({ where: { id: folder.id } })) continue;
    await prisma.documentFolder.create({ data: { ...folder, tenantId } });
  }
  let docs = 0;
  for (const [position, doc] of manifest.documents.entries()) {
    if (await prisma.document.findUnique({ where: { id: doc.id } })) continue;
    try {
      const ext = path.extname(doc.file);
      const media = await upload(tenantId, path.join(dir, 'files', doc.file), `${doc.titleRu.slice(0, 120)}${ext}`);
      await prisma.document.create({
        data: { id: doc.id, tenantId, folderId: doc.folderId, titleRu: doc.titleRu, titleKk: doc.titleKk, mediaId: media.id, position },
      });
      docs++;
    } catch (error) {
      failed.push(`документ «${doc.titleRu}»: ${(error as Error).message}`);
    }
  }
  console.log(`документов загружено: ${docs} из ${manifest.documents.length}`);

  // ── разделы: новые страницы и типовые разделы, порядок, вложенность ──
  const sections = async () => prisma.section.findMany({ where: { tenantId }, orderBy: { position: 'asc' } });
  const wanted = [
    ...(manifest.sections ?? []),
    ...manifest.pages.filter((p) => !p.existing).map((p) => ({ type: p.type ?? 'PAGE', slug: p.slug, titleRu: p.titleRu!, titleKk: p.titleKk!, after: p.after })),
  ];
  for (const entry of wanted) {
    const list = await sections();
    if (list.some((s) => s.slug === entry.slug)) continue;
    const after = list.find((s) => s.slug === entry.after);
    const position = after ? after.position + 1 : list.length;
    await prisma.section.updateMany({ where: { tenantId, parentId: null, position: { gte: position } }, data: { position: { increment: 1 } } });
    await prisma.section.create({ data: { tenantId, type: entry.type, slug: entry.slug, titleRu: entry.titleRu, titleKk: entry.titleKk, position } });
  }
  const bySlug = new Map((await sections()).map((s) => [s.slug, s]));
  for (const [parent, children] of Object.entries(manifest.nest ?? {})) {
    const parentId = bySlug.get(parent)?.id;
    if (!parentId) continue;
    for (const [position, slug] of children.entries()) {
      const child = bySlug.get(slug);
      if (child) await prisma.section.update({ where: { id: child.id }, data: { parentId, position } });
    }
  }
  if (manifest.hideSections?.length) {
    await prisma.section.updateMany({ where: { tenantId, slug: { in: manifest.hideSections } }, data: { isVisible: false } });
  }

  // ── страницы ──
  for (const page of manifest.pages) {
    const section = bySlug.get(page.slug);
    if (!section) {
      failed.push(`страница ${page.slug}: нет раздела`);
      continue;
    }
    let body = page.bodyRu;
    for (const name of new Set(Array.from(body.matchAll(/\{\{img:([^}]+)\}\}/g), (m) => m[1]))) {
      try {
        body = body.split(`{{img:${name}}}`).join(`/api/media/${await image(name)}`);
      } catch (error) {
        failed.push(`картинка ${name}: ${(error as Error).message}`);
      }
    }
    const bodyRu = sanitizeContent(body);
    await prisma.page.upsert({ where: { sectionId: section.id }, create: { tenantId, sectionId: section.id, bodyRu }, update: { bodyRu } });
  }
  console.log(`страниц: ${manifest.pages.length}`);

  // ── альбомы ──
  for (const [position, album] of manifest.albums.entries()) {
    if (album.photos.length === 0 || (await prisma.album.findFirst({ where: { tenantId, slug: album.slug } }))) continue;
    const created = await prisma.album.create({ data: { tenantId, slug: album.slug, titleRu: album.titleRu, titleKk: album.titleKk, descRu: album.descRu ?? null, position } });
    for (const [i, photo] of album.photos.entries()) {
      try {
        await prisma.albumItem.create({ data: { albumId: created.id, mediaId: await image(photo.img, photo.altRu), position: i } });
      } catch (error) {
        failed.push(`фото ${photo.img}: ${(error as Error).message}`);
      }
    }
  }
  console.log(`альбомов: ${manifest.albums.length}`);

  // ── педагоги, группы, кружки, вопросы, режим дня ──
  for (const [position, person] of manifest.staff.entries()) {
    if (await prisma.staffMember.findFirst({ where: { tenantId, fullName: person.fullName } })) continue;
    const { photo, ...fields } = person;
    let photoMediaId: string | null = null;
    try {
      photoMediaId = photo ? await image(photo, person.fullName) : null;
    } catch (error) {
      failed.push(`фото педагога ${person.fullName}: ${(error as Error).message}`);
    }
    await prisma.staffMember.create({ data: { tenantId, ...fields, photoMediaId, position } });
  }
  for (const [position, group] of manifest.groups.entries()) {
    if (await prisma.group.findFirst({ where: { tenantId, nameRu: group.nameRu } })) continue;
    await prisma.group.create({ data: { tenantId, ...group, position } });
  }
  for (const [position, club] of manifest.clubs.entries()) {
    if (await prisma.club.findFirst({ where: { tenantId, nameRu: club.nameRu } })) continue;
    const { nameRu, nameKk, descRu } = club;
    await prisma.club.create({ data: { tenantId, nameRu, nameKk, descRu, position } });
  }
  for (const [position, item] of manifest.faq.entries()) {
    if (await prisma.faqItem.findFirst({ where: { tenantId, questionRu: item.questionRu } })) continue;
    await prisma.faqItem.create({ data: { tenantId, ...item, position } });
  }
  if ((await prisma.routineItem.count({ where: { tenantId } })) === 0) {
    await prisma.routineItem.createMany({ data: manifest.routine.map((r, position) => ({ tenantId, ...r, position })) });
  }
  console.log(`педагогов: ${manifest.staff.length}, групп: ${manifest.groups.length}, кружков: ${manifest.clubs.length}, вопросов: ${manifest.faq.length}, режим: ${manifest.routine.length}`);

  if (failed.length) {
    console.warn(`\nНе перенеслось (${failed.length}):`);
    for (const line of failed) console.warn(`  ! ${line}`);
  } else {
    console.log('\nГотово, без ошибок.');
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
