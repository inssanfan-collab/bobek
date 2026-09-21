import type { Locale } from '@/lib/i18n';
import { isOfficeDoc } from '@/lib/media-kind';

/**
 * Файлы, прикреплённые в тексте, показываются карточкой — как в разделе
 * «Документы»: значок вида, название, размер, «Открыть» и «Скачать».
 *
 * В базе лежит обычная ссылка `<a href="/api/media/…">`, а карточка
 * собирается при выводе. Храни мы готовую разметку, заведующая могла бы
 * случайно дописать текст внутрь кнопки, а подписи застряли бы на том
 * языке, на котором файл вставили.
 */

export type FileInfo = { mime: string; size: number; origName: string };
type Kind = 'pdf' | 'word' | 'excel' | 'file';

const T = {
  open: { kk: 'Ашу', ru: 'Открыть' },
  download: { kk: 'Жүктеу', ru: 'Скачать' },
  kb: { kk: 'КБ', ru: 'КБ' },
  mb: { kk: 'МБ', ru: 'МБ' },
} as const;

const LABEL: Record<Kind, string> = { pdf: 'PDF', word: 'Word', excel: 'Excel', file: 'Файл' };
const BADGE: Record<Kind, string> = { pdf: 'PDF', word: 'DOC', excel: 'XLS', file: '📄' };

/**
 * Ссылка на загруженный файл. Атрибуты после href добавляет санитайзер
 * (rel, target), поэтому их пропускаем любые.
 */
const MEDIA_LINK = /<a\b[^>]*?\bhref="\/api\/media\/([A-Za-z0-9_-]+)(?:\?[^"]*)?"[^>]*>([\s\S]*?)<\/a>/g;

function kindOf(mime: string | undefined, name: string): Kind | null {
  if (mime) {
    if (mime.startsWith('image/')) return null;
    if (mime === 'application/pdf') return 'pdf';
    if (isOfficeDoc(mime)) return mime.includes('word') ? 'word' : 'excel';
    return 'file';
  }
  // Предпросмотр в редакторе базы не видит — вид угадываем по расширению.
  const ext = name.toLowerCase().match(/\.([a-z0-9]+)\s*$/)?.[1];
  if (ext === 'pdf') return 'pdf';
  if (ext === 'doc' || ext === 'docx') return 'word';
  if (ext === 'xls' || ext === 'xlsx') return 'excel';
  return 'file';
}

function formatSize(bytes: number, locale: Locale): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} ${T.kb[locale]}`;
  return `${(bytes / 1024 / 1024).toFixed(1).replace('.', locale === 'ru' ? ',' : '.')} ${T.mb[locale]}`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

/** id всех файлов, на которые ссылается текст, — чтобы одним запросом достать их размеры. */
export function mediaIdsIn(html: string): string[] {
  return [...new Set(Array.from(html.matchAll(MEDIA_LINK), (match) => match[1]!))];
}

/**
 * Заменяет ссылки на файлы карточками. `files` — сведения из базы; без них
 * (предпросмотр) карточка строится по названию, но без размера. Ссылки
 * на фото и ссылки вокруг картинок остаются как были.
 */
export function renderFileCards(html: string, locale: Locale, files: Map<string, FileInfo> | null): string {
  if (!html.includes('/api/media/')) return html;

  return html.replace(MEDIA_LINK, (whole, id: string, inner: string) => {
    if (/<img\b/i.test(inner)) return whole;
    const info = files?.get(id);
    // Файл из чужого сада или уже удалённый — не рисуем кнопок, ведущих в 404.
    if (files && !info) return whole;

    const text = inner.replace(/<[^>]+>/g, '').replace(/^\s*📎\s*/u, '').replace(/&nbsp;/g, ' ').trim();
    const kind = kindOf(info?.mime, text || info?.origName || '');
    if (!kind) return whole;

    // Расширение не повторяем: вид файла и так написан под названием.
    const name = (text || escapeHtml(info?.origName ?? '')).replace(/\.(pdf|docx?|xlsx?)$/i, '') || text;
    const lang = `?lang=${locale}`;
    const openHref = kind === 'word' || kind === 'excel' ? `/doc/${id}${lang}` : `/api/media/${id}`;
    const meta = info ? `${LABEL[kind]} · ${formatSize(info.size, locale)}` : LABEL[kind];

    return (
      `<span class="file-card" data-kind="${kind}">` +
      `<span class="file-card-badge" aria-hidden="true">${BADGE[kind]}</span>` +
      `<span class="file-card-text"><span class="file-card-name">${name}</span>` +
      `<span class="file-card-meta">${meta}</span></span>` +
      `<span class="file-card-actions">` +
      `<a class="file-card-open" href="${openHref}" target="_blank" rel="noopener noreferrer">${T.open[locale]}</a>` +
      `<a class="file-card-download" href="/api/media/${id}?download=1" download aria-label="${T.download[locale]}: ${name.replace(/"/g, '&quot;')}">${T.download[locale]}</a>` +
      `</span></span>`
    );
  });
}
