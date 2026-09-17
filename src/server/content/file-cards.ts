import 'server-only';
import type { TenantScope } from '@/server/db/scope';
import { mediaIdsIn, renderFileCards, type FileInfo } from '@/lib/file-cards';
import type { Locale } from '@/lib/i18n';

/** Текст сада с карточками прикреплённых файлов. Файлы ищутся только в своём саду. */
export async function withFileCards(html: string, db: TenantScope, locale: Locale): Promise<string> {
  const ids = mediaIdsIn(html);
  if (ids.length === 0) return html;
  const rows = await db.media.findMany({
    where: { id: { in: ids } },
    select: { id: true, mime: true, size: true, origName: true },
  });
  const files = new Map<string, FileInfo>(rows.map((row) => [row.id, row]));
  return renderFileCards(html, locale, files);
}
