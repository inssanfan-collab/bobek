import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { env } from '@/lib/env';
import { normalizeHost } from '@/lib/host';

export const dynamic = 'force-dynamic';

/**
 * Caddy спрашивает здесь перед выпуском сертификата в режиме on_demand_tls.
 * Без этой проверки любой, кто направит свой домен на наш IP, заставил бы нас
 * выпускать ему сертификаты и быстро упёрся бы в лимиты Let's Encrypt.
 *
 * Ответ 200 — выпускать можно, любой другой — нельзя.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const host = normalizeHost(url.searchParams.get('domain'));

  // Дополнительная защита: эндпоинт доступен только Caddy на этом же сервере.
  if (env.tlsAskToken) {
    const supplied = request.headers.get('x-tls-token') ?? url.searchParams.get('token') ?? '';
    if (supplied !== env.tlsAskToken) return new NextResponse('forbidden', { status: 403 });
  }

  if (!host) return new NextResponse('bad request', { status: 400 });

  // Поддомены портала закрывает wildcard-сертификат, здесь их не обслуживаем.
  if (host === env.portalDomain || host.endsWith(`.${env.portalDomain}`)) {
    return new NextResponse('ok', { status: 200 });
  }

  const domain = await prisma.domain.findUnique({
    where: { host },
    include: { tenant: { select: { status: true } } },
  });

  if (!domain || domain.tenant.status === 'ARCHIVED') {
    return new NextResponse('unknown domain', { status: 404 });
  }

  return new NextResponse('ok', { status: 200 });
}
