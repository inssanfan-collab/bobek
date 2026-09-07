import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { resolveTenantByHost } from '@/server/tenant/resolve';
import { hashSessionToken, rotateSessionToken, SESSION_COOKIE } from '@/server/auth/session';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

/** Сколько живёт одноразовая ссылка входа «под садом». */
const HANDOFF_TTL_MS = 2 * 60 * 1000;

/**
 * Приём сессии, созданной на домене портала.
 *
 * Cookie привязана к домену, поэтому «Войти как сад» не может просто поставить её
 * у себя: на домене сада её никто не отправит. Токен передаётся один раз в адресе,
 * здесь обменивается на cookie и сразу же ротируется — значение из адресной строки
 * (оно оседает в истории браузера и логах) больше не работает.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ host: string }> },
) {
  const { host } = await params;
  const url = new URL(request.url);
  const token = url.searchParams.get('t') ?? '';

  // request.url здесь указывает на внутренний переписанный адрес (localhost/s/...),
  // поэтому адрес возврата собираем из заголовка Host — иначе уводит не туда.
  const requestHost = request.headers.get('host') ?? decodeURIComponent(host);
  const proto = request.headers.get('x-forwarded-proto') ?? (env.cookieSecure ? 'https' : 'http');
  const on = (path: string) => `${proto}://${requestHost}${path}`;

  const site = await resolveTenantByHost(decodeURIComponent(host));
  if (!site || !token) return NextResponse.redirect(on('/admin/login'));

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: { user: true },
  });

  const isValidHandoff =
    session !== null &&
    session.impersonatedBy !== null &&
    session.expiresAt > new Date() &&
    Date.now() - session.createdAt.getTime() < HANDOFF_TTL_MS &&
    session.user.isActive &&
    session.user.tenantId === site.tenant.id;

  if (!isValidHandoff) {
    return NextResponse.redirect(on('/admin/login'));
  }

  const fresh = await rotateSessionToken(session.id);

  const response = NextResponse.redirect(on('/admin'));
  response.cookies.set(SESSION_COOKIE, fresh, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.cookieSecure,
    path: '/',
    expires: session.expiresAt,
  });
  return response;
}
