/**
 * Разбор ссылки на ролик. Своё видео мы не храним: минута съёмки с телефона
 * весит больше, чем весь сайт сада, а перекодировать её на общем сервере нечем.
 * Поэтому сад вставляет ссылку, а показывает ролик тот, кто его хранит.
 *
 * Ни YouTube, ни Instagram не требуют для этого ключа или заявки — берётся
 * их открытая страница проигрывателя. У YouTube по ссылке достаётся ещё
 * и обложка, у Instagram её отдают только по токену, поэтому там обложку
 * ставит сам сад.
 */

export type VideoKind = 'youtube' | 'instagram';

export type VideoRef = {
  kind: VideoKind;
  /** Идентификатор ролика у сервиса. */
  id: string;
  /** Адрес проигрывателя для вставки в страницу. */
  embedUrl: string;
  /** Адрес ролика у сервиса — для ссылки «Смотреть в …». */
  pageUrl: string;
  /** Обложка, если сервис отдаёт её без ключа. */
  posterUrl: string | null;
};

const YOUTUBE_HOSTS = new Set([
  'youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtu.be',
]);

const INSTAGRAM_HOSTS = new Set(['instagram.com', 'www.instagram.com']);

/** Идентификатор ролика YouTube — 11 символов. */
const YOUTUBE_ID = /^[\w-]{11}$/;

/** Код публикации Instagram: буквы, цифры, дефис и подчёркивание. */
const INSTAGRAM_CODE = /^[\w-]{5,20}$/;

function youtubeId(url: URL): string | null {
  if (url.hostname.endsWith('youtu.be')) {
    const id = url.pathname.slice(1).split('/')[0] ?? '';
    return YOUTUBE_ID.test(id) ? id : null;
  }

  const fromQuery = url.searchParams.get('v');
  if (fromQuery && YOUTUBE_ID.test(fromQuery)) return fromQuery;

  // /embed/<id>, /shorts/<id>, /live/<id> — все три встречаются в ссылках,
  // которыми делятся с телефона.
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts.length >= 2 && ['embed', 'shorts', 'live', 'v'].includes(parts[0]!)) {
    const id = parts[1]!;
    return YOUTUBE_ID.test(id) ? id : null;
  }

  return null;
}

function instagramCode(url: URL): string | null {
  // Ссылка из приложения приходит и как /reel/<код>, и как /<аккаунт>/reel/<код>.
  const parts = url.pathname.split('/').filter(Boolean);
  const at = parts.findIndex((part) => part === 'p' || part === 'reel' || part === 'reels' || part === 'tv');
  if (at < 0) return null;
  const code = parts[at + 1];
  return code && INSTAGRAM_CODE.test(code) ? code : null;
}

/**
 * Разбирает ссылку, которую вставил сад. Возвращает null, если это
 * не поддерживаемый сервис — тогда админка попросит другую ссылку.
 */
export function parseVideo(input: string | null | undefined): VideoRef | null {
  const raw = (input ?? '').trim();
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();

  if (YOUTUBE_HOSTS.has(host)) {
    const id = youtubeId(url);
    if (!id) return null;
    return {
      kind: 'youtube',
      id,
      // nocookie — пока ролик не запустили, YouTube не пишет посетителю ничего.
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
      pageUrl: `https://www.youtube.com/watch?v=${id}`,
      posterUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  }

  if (INSTAGRAM_HOSTS.has(host)) {
    const code = instagramCode(url);
    if (!code) return null;
    const kind = url.pathname.includes('/p/') ? 'p' : 'reel';
    return {
      kind: 'instagram',
      id: code,
      embedUrl: `https://www.instagram.com/${kind}/${code}/embed/`,
      pageUrl: `https://www.instagram.com/${kind}/${code}/`,
      posterUrl: null,
    };
  }

  return null;
}

export function isVideoUrl(input: string | null | undefined): boolean {
  return parseVideo(input) !== null;
}
