import 'server-only';
import { parseInstagramPage, type InstagramPost } from '@/lib/instagram';

/**
 * Страница поста Instagram — так, как её получает превью ссылок в мессенджерах.
 * С обычным браузерным User-Agent сервер из дата-центра получает стену входа,
 * а превью Instagram отдаёт всем: иначе ссылки в WhatsApp были бы без картинки.
 */
const PREVIEW_AGENT = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)';

export async function fetchInstagramPost(code: string): Promise<InstagramPost | null> {
  try {
    const response = await fetch(`https://www.instagram.com/p/${encodeURIComponent(code)}/`, {
      headers: { 'User-Agent': PREVIEW_AGENT, 'Accept-Language': 'en' },
      redirect: 'follow',
      signal: AbortSignal.timeout(15_000),
      cache: 'no-store',
    });
    if (!response.ok) return null;
    return parseInstagramPage(await response.text(), code);
  } catch {
    return null;
  }
}

/**
 * Обложка поста. Ссылки Instagram на картинки подписаны и через несколько
 * дней перестают открываться, поэтому картинку забираем к себе сразу.
 * Качаем только с их CDN: адрес пришёл со страницы, а не от пользователя,
 * но лишний раз ходить сервером по произвольным адресам незачем.
 */
export async function fetchInstagramImage(url: string): Promise<File | null> {
  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    return null;
  }
  if (!/(^|\.)(cdninstagram\.com|fbcdn\.net)$/i.test(host)) return null;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(20_000), cache: 'no-store' });
    if (!response.ok) return null;
    const type = response.headers.get('content-type') ?? 'image/jpeg';
    if (!type.startsWith('image/')) return null;
    return new File([await response.arrayBuffer()], 'instagram.jpg', { type });
  } catch {
    return null;
  }
}
