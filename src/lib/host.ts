/**
 * Разбор входящего Host. Чистая функция без обращений к БД — её легко покрыть тестами
 * и вызвать из middleware, который работает в edge-рантайме.
 */
export type HostKind =
  | { kind: 'portal' }
  | { kind: 'subdomain'; slug: string }
  | { kind: 'custom'; host: string };

/** Отрезает порт и приводит к нижнему регистру: в dev Host приходит как `sad1.bobegim.local:3000`. */
export function normalizeHost(rawHost: string | null | undefined): string {
  if (!rawHost) return '';
  const withoutPort = rawHost.split(':')[0] ?? '';
  return withoutPort.trim().toLowerCase().replace(/\.$/, '');
}

/** Метки, которые не могут быть садом: их занимает сам портал и инфраструктура. */
export const RESERVED_SLUGS = new Set([
  'www', 'admin', 'api', 'mail', 'smtp', 'imap', 'ftp', 'ns', 'ns1', 'ns2',
  'static', 'cdn', 'assets', 'media', 'files', 'portal', 'app', 'test',
  'staging', 'dev', 'demo', 'help', 'support', 'blog', 'shop', 'my', 'go',
]);

// Ровно то, что обещает подсказка в форме: 3–32 символа, начинается и кончается
// буквой или цифрой. Короткие адреса вроде «a» не годятся — их невозможно продиктовать.
const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/;

export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug) && !slug.includes('--') && !RESERVED_SLUGS.has(slug);
}

export function classifyHost(rawHost: string | null | undefined, portalDomain: string): HostKind {
  const host = normalizeHost(rawHost);
  const portal = normalizeHost(portalDomain);
  if (!host) return { kind: 'portal' };

  if (host === portal || host === `www.${portal}`) return { kind: 'portal' };

  if (host.endsWith(`.${portal}`)) {
    const label = host.slice(0, -(portal.length + 1));
    // Многоуровневые поддомены садам не выдаём: a.b.bobegim.kz — это не сад.
    if (!label.includes('.') && isValidSlug(label)) return { kind: 'subdomain', slug: label };
    return { kind: 'portal' };
  }

  return { kind: 'custom', host };
}

/** Публичный адрес сада на домене портала. */
export function subdomainFor(slug: string, portalDomain: string): string {
  return `${slug}.${normalizeHost(portalDomain)}`;
}
