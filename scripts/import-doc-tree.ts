/**
 * Перенос дерева документов (обычно — из папки Google Диска) в раздел
 * «Документы» сада: папки, вложенные папки и файлы, названия на двух языках.
 *
 * Материалы самооценки сады годами держат на Диске — восемь разделов,
 * внутри учебные годы, полторы сотни PDF. Загружать это руками — день работы.
 *
 * Запуск (условие react-server обязательно: сохранение файлов помечено
 * server-only, и без него импорт падает ещё до первой строки):
 *   node --conditions=react-server --import tsx scripts/import-doc-tree.ts <домен> <файл.json>
 *
 * Формат файла:
 *   { "folders": [ { "titleKk", "titleRu", "folders": [...], "files": [...] } ],
 *     "files":   [ { "titleKk", "titleRu", "driveId" | "url", "fileName" } ] }
 *
 * Перевод скрипт не выдумывает — обе версии приходят в файле.
 * Повторный запуск ничего не портит: папка с таким же названием на том же
 * месте берётся существующая, документ с таким же названием в папке
 * пропускается. Поэтому оборванный импорт можно просто запустить снова.
 */
import { promises as fs } from 'node:fs';
import { prisma } from '../src/server/db';
import { saveUpload } from '../src/server/media';

type FileEntry = { titleKk: string; titleRu: string; driveId?: string; url?: string; fileName?: string };
type FolderEntry = { titleKk: string; titleRu: string; folders?: FolderEntry[]; files?: FileEntry[] };

const MIME: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

const stats = { folders: 0, files: 0, skipped: 0, failed: [] as string[] };

/**
 * Файл с Диска. Обычная ссылка на большой файл отдаёт страницу «не удалось
 * проверить на вирусы» вместо содержимого — поэтому адрес с confirm=t,
 * и поэтому же проверяем, что пришёл файл, а не HTML.
 */
async function download(entry: FileEntry): Promise<Buffer> {
  const url = entry.url
    ?? `https://drive.usercontent.google.com/download?id=${entry.driveId}&export=download&confirm=t`;
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(url, { redirect: 'follow' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.subarray(0, 64).toString('latin1').toLowerCase().includes('<!doctype html')) {
        throw new Error('вместо файла пришла страница — доступ к файлу закрыт?');
      }
      return buffer;
    } catch (error) {
      if (attempt >= 3) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
    }
  }
}

async function folderFor(tenantId: string, parentId: string | null, entry: FolderEntry, position: number) {
  const existing = await prisma.documentFolder.findFirst({ where: { tenantId, parentId, titleKk: entry.titleKk } });
  if (existing) {
    // Перевод могли поправить в манифесте — обновляем, место не трогаем.
    if (existing.titleRu !== entry.titleRu) {
      await prisma.documentFolder.update({ where: { id: existing.id }, data: { titleRu: entry.titleRu } });
    }
    return existing.id;
  }
  stats.folders++;
  const created = await prisma.documentFolder.create({
    data: { tenantId, parentId, titleKk: entry.titleKk, titleRu: entry.titleRu, position },
  });
  return created.id;
}

async function importFiles(tenantId: string, folderId: string | null, files: FileEntry[], trail: string) {
  for (const [position, entry] of files.entries()) {
    const known = await prisma.document.findFirst({ where: { tenantId, folderId, titleKk: entry.titleKk } });
    if (known) {
      stats.skipped++;
      if (known.titleRu !== entry.titleRu) {
        await prisma.document.update({ where: { id: known.id }, data: { titleRu: entry.titleRu } });
      }
      continue;
    }
    const name = entry.fileName ?? `${entry.titleKk}.pdf`;
    try {
      const buffer = await download(entry);
      const ext = name.split('.').pop()?.toLowerCase() ?? 'pdf';
      const media = await saveUpload(new File([new Uint8Array(buffer)], name, { type: MIME[ext] ?? 'application/pdf' }), tenantId);
      await prisma.document.create({
        data: { tenantId, folderId, titleKk: entry.titleKk, titleRu: entry.titleRu, mediaId: media.id, position },
      });
      stats.files++;
      console.log(`  + ${trail}${entry.titleKk} (${Math.round(buffer.length / 1024)} КБ)`);
    } catch (error) {
      stats.failed.push(`${trail}${entry.titleKk}: ${(error as Error).message}`);
      console.warn(`  ! ${trail}${entry.titleKk}: ${(error as Error).message}`);
    }
  }
}

async function importFolder(tenantId: string, parentId: string | null, node: FolderEntry, trail: string) {
  for (const [position, child] of (node.folders ?? []).entries()) {
    const id = await folderFor(tenantId, parentId, child, position);
    const childTrail = `${trail}${child.titleKk} / `;
    console.log(`[${childTrail.slice(0, -3)}]`);
    await importFolder(tenantId, id, child, childTrail);
  }
  await importFiles(tenantId, parentId, node.files ?? [], trail);
}

async function main() {
  const [host, jsonPath] = process.argv.slice(2);
  if (!host || !jsonPath) {
    console.error('Укажите домен сада и файл: … import-doc-tree.ts sad.edusad.kz tree.json');
    process.exit(1);
  }
  const domain = await prisma.domain.findUnique({ where: { host }, include: { tenant: true } });
  if (!domain) throw new Error(`Сад с доменом ${host} не найден`);
  const tenant = domain.tenant;

  const tree = JSON.parse(await fs.readFile(jsonPath, 'utf8')) as FolderEntry;
  console.log(`Сад: ${host}`);
  await importFolder(tenant.id, null, tree, '');

  console.log(`\nГотово: папок создано ${stats.folders}, файлов загружено ${stats.files}, уже были ${stats.skipped}.`);
  if (stats.failed.length) {
    console.log(`Не загрузились (${stats.failed.length}) — запустите ещё раз:`);
    for (const line of stats.failed) console.log(`  ${line}`);
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
