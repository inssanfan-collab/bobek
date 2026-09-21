import { promises as fs } from 'node:fs';
import { NextResponse } from 'next/server';
import { publicSiteContext, localeFrom } from '@/server/tenant/context';
import { sectionTitle } from '@/server/tenant/section-title';
import { storagePathFor } from '@/server/media';
import { archivePlan } from '@/lib/doc-tree';
import { pick } from '@/lib/i18n';
import {
  ZIP_LIMIT, centralHeader, crc32, endOfCentralDirectory, localHeader, safeZipName, zipSize,
  type ZipEntryMeta,
} from '@/lib/zip';

export const dynamic = 'force-dynamic';

const EXT: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
};

/**
 * «Скачать все документы» (или одну папку) одним ZIP. Папки сайта становятся
 * папками архива. Архив собирается на лету и отдаётся потоком: у сада бывает
 * полгигабайта самооценки, и держать её в памяти целиком нельзя. Размер
 * известен заранее (без сжатия), поэтому браузер показывает прогресс.
 *
 * Документы сада и так открыты всем по одному, поэтому доступ тот же, что
 * у раздела: публичный сайт, только файлы своего сада (через scoped).
 */
export async function GET(request: Request, { params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const context = await publicSiteContext(host);
  const url = new URL(request.url);
  const locale = localeFrom(url.searchParams.get('lang') ?? undefined);

  const [folders, documents] = await Promise.all([
    context.db.docFolders.findMany({ orderBy: { position: 'asc' } }),
    context.db.documents.findMany({
      orderBy: [{ position: 'asc' }, { publishedAt: 'desc' }],
      include: { media: true },
    }),
  ]);

  const folderParam = url.searchParams.get('folder');
  const root = folderParam ? folders.find((f) => f.id === folderParam) : null;
  if (folderParam && !root) return new NextResponse('Not found', { status: 404 });

  const plan = archivePlan(
    folders,
    documents.map((doc) => ({ ...doc, ext: EXT[doc.media.mime] ?? doc.media.origName.split('.').pop() ?? '' })),
    root?.id ?? null,
    locale,
    safeZipName,
  );
  if (plan.length === 0) return new NextResponse('Not found', { status: 404 });

  // Размер берём с диска, а не из базы: заголовок Content-Length должен
  // совпасть до байта, иначе браузер оборвёт загрузку в самом конце.
  const entries: (ZipEntryMeta & { file: string })[] = [];
  for (const { path, doc } of plan) {
    const file = storagePathFor(doc.media.path);
    const stat = await fs.stat(file).catch(() => null);
    if (!stat) continue; // файл пропал с диска — лучше архив без него, чем никакого
    entries.push({ name: path, size: stat.size, modified: doc.publishedAt, file });
  }
  const total = zipSize(entries);
  if (entries.length === 0) return new NextResponse('Not found', { status: 404 });
  if (total > ZIP_LIMIT) return new NextResponse('Archive too large', { status: 413 });

  const title = root
    ? pick(locale, root.titleKk, root.titleRu)
    : await sectionTitle(context.tenant.id, 'DOCUMENTS', locale, locale === 'kk' ? 'Құжаттар' : 'Документы');
  const fileName = `${safeZipName(title)}.zip`;

  let index = 0;
  let offset = 0;
  const central: Uint8Array[] = [];

  const stream = new ReadableStream<Uint8Array>({
    // По одному файлу за раз: в памяти не больше одного документа.
    async pull(controller) {
      if (index < entries.length) {
        const entry = entries[index++]!;
        const data = await fs.readFile(entry.file);
        const meta = { ...entry, size: data.length };
        const crc = crc32(data);
        const header = localHeader(meta, crc);
        central.push(centralHeader(meta, crc, offset));
        offset += header.length + data.length;
        controller.enqueue(header);
        controller.enqueue(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
        return;
      }
      const centralSize = central.reduce((sum, part) => sum + part.length, 0);
      for (const part of central) controller.enqueue(part);
      controller.enqueue(endOfCentralDirectory(central.length, centralSize, offset));
      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Length': String(total),
      'Content-Disposition': `attachment; filename="documents.zip"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      'Cache-Control': 'no-store',
      // nginx иначе копит ответ во временном файле, и загрузка стартует
      // только после того, как сервер соберёт весь архив.
      'X-Accel-Buffering': 'no',
    },
  });
}
