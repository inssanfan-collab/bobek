import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/server/db';
import { SESSION_COOKIE, hashSessionToken } from '@/server/auth/session';

export const dynamic = 'force-dynamic';

/**
 * Присутствие в админке — для раздела «Онлайн» админки портала: перед
 * выкладкой владелец видит, работает ли сейчас кто-нибудь.
 *
 * Открытая вкладка админки (AdminPresence) раз в 30 секунд присылает, какой
 * раздел открыт и как давно человек что-то делал; при закрытии вкладки —
 * { leave: true }. Пишется в его же сессию, больше ничего этот адрес не умеет.
 *
 * Обработчик, а не server action: адрес не меняется от выкладки к выкладке,
 * и вкладка, открытая до обновления, продолжает отмечаться.
 */
export async function POST(request: NextRequest) {
  // Только со своей же страницы: чужой сайт не должен отмечать за человека присутствие.
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (origin && host && new URL(origin).host !== host) return new NextResponse(null, { status: 403 });

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return new NextResponse(null, { status: 401 });

  let body: { path?: unknown; idle?: unknown; leave?: unknown } = {};
  try {
    // sendBeacon шлёт text/plain — читаем текст, а не json().
    body = JSON.parse(await request.text());
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const now = new Date();
  const where = { tokenHash: hashSessionToken(token), expiresAt: { gt: now } };

  if (body.leave === true) {
    await prisma.session.updateMany({ where, data: { lastSeenAt: null } });
    return new NextResponse(null, { status: 204 });
  }

  const path = typeof body.path === 'string' && body.path.startsWith('/admin') ? body.path.slice(0, 200) : null;
  const idle = typeof body.idle === 'number' && Number.isFinite(body.idle) ? Math.max(0, Math.min(body.idle, 86_400)) : 0;
  await prisma.session.updateMany({
    where,
    data: { lastSeenAt: now, lastPath: path, lastActiveAt: new Date(now.getTime() - idle * 1000) },
  });
  return new NextResponse(null, { status: 204 });
}
