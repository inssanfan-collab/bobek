import sanitizeHtml from 'sanitize-html';

/**
 * Контент пишут сотрудники садов и часто вставляют его из Word, где приезжает
 * мусорная разметка и вредные атрибуты. Чистим на сервере при сохранении,
 * а не при выводе: в базе должен лежать уже безопасный HTML.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'blockquote',
    'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'a', 'img', 'figure', 'figcaption',
    'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'span',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    span: ['class'],
    td: ['colspan', 'rowspan'],
    th: ['colspan', 'rowspan'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  // Картинки разрешаем только свои: чужие ломают приватность и отваливаются со временем.
  allowedSchemesByTag: { img: ['https', 'http'] },
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: { ...attribs, rel: 'noopener noreferrer nofollow', target: '_blank' },
    }),
    b: 'strong',
    i: 'em',
  },
  exclusiveFilter: (frame) =>
    // Пустые абзацы после вставки из Word — выкидываем.
    frame.tag === 'p' && !frame.text.trim() && !frame.mediaChildren.length,
};

export function sanitizeContent(dirty: string | null | undefined): string {
  if (!dirty) return '';
  return sanitizeHtml(dirty, OPTIONS).trim();
}

/** Короткий текстовый анонс из HTML — для карточек и мета-описаний. */
export function toPlainText(html: string | null | undefined, maxLength = 200): string {
  if (!html) return '';
  const text = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).replace(/\s+\S*$/, '')}…`;
}
