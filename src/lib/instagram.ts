/**
 * Перенос постов Instagram в новости сада: разбор ссылок и страницы поста.
 *
 * Официального доступа к Instagram у нас нет и не будет, а список постов
 * аккаунта сервер без входа не получает (внутренний адрес отвечает 401).
 * Поэтому ссылки даёт сотрудник, а сервер по каждой открывает страницу
 * поста — её Instagram отдаёт всем, чтобы работали превью ссылок
 * в мессенджерах. Из её мета-тегов берём аккаунт, тип, подпись, дату
 * и обложку. Модуль без серверных зависимостей: всё здесь проверяется тестами.
 */

/** Больше за раз не берём: столько сотрудник и не выберет, а Instagram не любит поток запросов. */
export const INSTAGRAM_BATCH_LIMIT = 12;

const CODE = /^[\w-]{5,20}$/;
const KINDS = new Set(['p', 'reel', 'reels', 'tv']);

/** Ссылка на пост в любом виде, как её копируют из приложения и браузера. */
const LINK = /(?:https?:\/\/)?(?:www\.|m\.)?instagram\.com\/[^\s"'<>]+/gi;

/**
 * Коды постов из вставленного текста — по порядку, без повторов, не больше
 * `limit`. Годится и одна ссылка, и столбик, и текст сообщения со ссылками.
 */
export function extractInstagramCodes(text: string, limit = INSTAGRAM_BATCH_LIMIT): string[] {
  const codes: string[] = [];
  for (const match of text.matchAll(LINK)) {
    const code = codeFromUrl(match[0]);
    if (code && !codes.includes(code)) codes.push(code);
    if (codes.length >= limit) break;
  }
  return codes;
}

/** Код поста из ссылки: /p/<код>, /reel/<код>, /<аккаунт>/reel/<код>. */
export function codeFromUrl(input: string): string | null {
  let url: URL;
  try {
    url = new URL(input.startsWith('http') ? input : `https://${input}`);
  } catch {
    return null;
  }
  if (!/(^|\.)instagram\.com$/i.test(url.hostname)) return null;
  const parts = url.pathname.split('/').filter(Boolean);
  const at = parts.findIndex((part) => KINDS.has(part));
  const code = at >= 0 ? parts[at + 1] : undefined;
  return code && CODE.test(code) ? code : null;
}

export type InstagramPost = {
  code: string;
  /** Аккаунт, которому принадлежит пост, — из канонической ссылки. */
  account: string | null;
  /** Ролик или фото (фото и карусель у Instagram — /p/). */
  kind: 'reel' | 'photo';
  /** Каноническая ссылка на пост. */
  url: string;
  caption: string;
  /** День публикации: время Instagram на странице поста не отдаёт. */
  date: string | null;
  imageUrl: string | null;
};

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

/** Раскрывает HTML-сущности мета-тегов: &#x41a;, &#1050;, &quot;. */
export function decodeEntities(value: string): string {
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (whole, entity: string) => {
    if (entity[0] === '#') {
      const code = entity[1]?.toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
    }
    return ENTITIES[entity.toLowerCase()] ?? whole;
  });
}

function meta(html: string, name: string): string | null {
  const re = new RegExp(`<meta\\s+(?:property|name)="${name.replace(/[:.]/g, '\\$&')}"\\s+content="([^"]*)"`, 'i');
  const found = re.exec(html);
  return found ? decodeEntities(found[1]!) : null;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * Страница поста → данные. og:description выглядит так:
 * «17 likes, 2 comments - akshat.alan on September 26, 2026: "подпись".»
 * Подписи может не быть совсем — тогда строка обрывается на дате.
 * Вернёт null, если это не страница поста (например, стена входа).
 */
export function parseInstagramPage(html: string, fallbackCode: string): InstagramPost | null {
  const canonical = meta(html, 'og:url');
  const description = meta(html, 'og:description');
  if (!canonical || description === null) return null;

  const code = codeFromUrl(canonical) ?? fallbackCode;
  const parts = new URL(canonical).pathname.split('/').filter(Boolean);
  const kindAt = parts.findIndex((part) => KINDS.has(part));
  const account = kindAt > 0 ? parts[kindAt - 1]!.toLowerCase() : null;
  const kind = kindAt >= 0 && parts[kindAt] !== 'p' ? 'reel' : 'photo';

  const found = /\s-\s[\w.]+\s(?:on\s)?([A-Z][a-z]+)\s(\d{1,2}),\s(\d{4})(?::\s"([\s\S]*)"\.?)?\s*$/.exec(description);
  let date: string | null = null;
  let caption = '';
  if (found) {
    const month = MONTHS.indexOf(found[1]!);
    if (month >= 0) date = `${found[3]}-${String(month + 1).padStart(2, '0')}-${found[2]!.padStart(2, '0')}`;
    caption = (found[4] ?? '').trim();
  }

  return {
    code,
    account,
    kind,
    url: `https://www.instagram.com/${kind === 'reel' ? 'reel' : 'p'}/${code}/`,
    caption,
    date,
    imageUrl: meta(html, 'og:image'),
  };
}

/** Аккаунт из адреса профиля в паспорте сада: https://instagram.com/akshat.alan → akshat.alan. */
export function accountFromProfile(value: string | null | undefined): string | null {
  const raw = (value ?? '').trim().replace(/^@/, '');
  if (!raw) return null;
  if (!raw.includes('/')) return /^[\w.]{1,30}$/.test(raw) ? raw.toLowerCase() : null;
  try {
    const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    const name = url.pathname.split('/').filter(Boolean)[0];
    return name && /^[\w.]{1,30}$/.test(name) ? name.toLowerCase() : null;
  } catch {
    return null;
  }
}

/** Подпись без хэштегов в конце и без пустых строк — текст новости. */
export function cleanCaption(caption: string): string {
  return caption
    .split('\n')
    .map((line) => line.trim())
    // Строка из одних хэштегов (и слов после них) — это хвост для поиска, а не текст.
    .filter((line) => line && !/^#/.test(line))
    .map((line) => line.replace(/(?:\s+#[\p{L}\p{N}_]+)+\s*$/u, '').trim())
    .filter(Boolean)
    .join('\n');
}

/**
 * Заголовок новости из подписи: первая строка без эмодзи по краям, не длиннее
 * 90 знаков. Нет подписи — «Жаңалық, 26 қыркүйек», сотрудник поправит.
 */
export function titleFromCaption(caption: string, fallback: string): string {
  const first = cleanCaption(caption).split('\n')[0] ?? '';
  const trimmed = first.replace(/^[^\p{L}\p{N}«"“№]+/u, '').replace(/[^\p{L}\p{N}»"”).!?]+$/u, '').trim();
  if (!trimmed) return fallback;
  if (trimmed.length <= 90) return trimmed;
  const cut = trimmed.slice(0, 90);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 40 ? cut.lastIndexOf(' ') : 90)}…`;
}

/**
 * Текст новости: подпись без строки, ставшей заголовком, — иначе она
 * повторялась бы сразу под заголовком.
 */
export function bodyFromCaption(caption: string, title: string): string {
  const lines = cleanCaption(caption).split('\n');
  const first = titleFromCaption(lines[0] ?? '', '');
  if (first && first === title.trim()) lines.shift();
  return lines.join('\n').trim();
}

/** Казахский ли текст: по буквам, которых нет в русском. */
export function looksKazakh(text: string): boolean {
  return /[әғқңөұүһі]/i.test(text);
}
