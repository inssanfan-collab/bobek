import { NextResponse, type NextRequest } from 'next/server';
import { classifyHost } from '@/lib/host';

/**
 * Единственная задача middleware — понять, чей это домен, и переписать путь.
 * В БД он не ходит: edge-рантайм не умеет Prisma, а сам резолв тенанта делает
 * layout сайта сада (там же и кэш доменов).
 */
export function middleware(request: NextRequest) {
  const portalDomain = process.env.PORTAL_DOMAIN ?? 'bobegim.kz';
  const parsed = classifyHost(request.headers.get('host'), portalDomain);

  // Внутренний префикс /s/<домен> — деталь реализации. Снаружи он не должен работать:
  // иначе с домена портала можно было бы открыть сайт любого сада по чужому адресу.
  if (request.nextUrl.pathname.startsWith('/s/')) {
    return new NextResponse('Not found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  if (parsed.kind === 'portal') return NextResponse.next();

  // Сайты садов адресуются полным хостом: и поддомен, и купленный садом домен
  // лежат в одной таблице Domain, поэтому путь резолва один на оба случая.
  const siteHost = parsed.kind === 'subdomain' ? `${parsed.slug}.${portalDomain}` : parsed.host;

  const url = request.nextUrl.clone();
  url.pathname = `/s/${encodeURIComponent(siteHost)}${request.nextUrl.pathname}`;

  const response = NextResponse.rewrite(url);
  response.headers.set('x-site-host', siteHost);
  return response;
}

export const config = {
  matcher: [
    // Пропускаем статику Next и общие API-роуты: медиа, health и запрос Caddy о сертификате
    // одинаковы для всех доменов, поэтому переписывать их под тенанта нельзя.
    '/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff2?)$).*)',
  ],
};
