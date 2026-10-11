/**
 * Откуда пришёл посетитель портала — для сводки владельцу в Telegram
 * (src/server/visits.ts). Реклама Google узнаётся по gclid в адресе
 * первой страницы, остальное — по странице, с которой перешли.
 */
export function sourceOf(referrer: string, landing: string): string {
  const params = new URL(landing || '/', 'https://x').searchParams;
  if (params.has('gclid') || params.has('gbraid') || params.has('wbraid')) return 'реклама Google';
  const utm = params.get('utm_source');
  if (utm) return `метка utm: ${utm}`;
  let host = '';
  try {
    host = new URL(referrer).hostname.replace(/^www\./, '');
  } catch {
    return 'прямой заход (адрес набран, закладка или мессенджер)';
  }
  if (/(^|\.)google\./.test(host)) return 'Google, поиск';
  if (/(^|\.)yandex\.|(^|\.)ya\.ru$/.test(host)) return 'Яндекс, поиск';
  if (/instagram\.com$/.test(host)) return 'Instagram';
  if (/facebook\.com$|fb\.com$/.test(host)) return 'Facebook';
  if (/t\.me$|telegram\./.test(host)) return 'Telegram';
  if (/whatsapp|wa\.me$/.test(host)) return 'WhatsApp';
  if (/bing\.com$/.test(host)) return 'Bing';
  if (/\.edusad\.kz$|\.edu\.kz$/.test(host)) return `с сайта сада ${host}`;
  if (host === 'edusad.kz') return 'внутренний переход';
  return host;
}

