import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/env';
import { SESSION_COOKIE } from '@/server/auth/session';
import { recordVisit, type VisitEvent } from '@/server/visits';

export const dynamic = 'force-dynamic';

const BOT = /bot|crawler|spider|crawling|slurp|facebookexternalhit|preview|monitor|watchdog|curl|wget|headless|lighthouse|pagespeed/i;

/**
 * Шаги посещения продающих страниц портала (VisitTracker) — для сводки
 * владельцу в Telegram, см. src/server/visits.ts. Только с домена портала:
 * сайты садов сюда ничего не шлют.
 */
export async function POST(request: NextRequest) {
  const host = (request.headers.get('host') ?? '').split(':')[0];
  if (host !== env.portalDomain && !host.startsWith('localhost')) return new NextResponse(null, { status: 404 });

  const userAgent = request.headers.get('user-agent') ?? '';
  // Роботов и самого владельца (вошёл в админку портала — есть cookie сессии) не считаем.
  if (!userAgent || BOT.test(userAgent) || request.cookies.get(SESSION_COOKIE)) return new NextResponse(null, { status: 204 });

  let event: VisitEvent;
  try {
    event = JSON.parse(await request.text()) as VisitEvent;
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const id = /^[A-Za-z0-9_-]{8,40}$/;
  if (!id.test(String(event.sid)) || !id.test(String(event.vid)) || !['page', 'ping', 'mark'].includes(event.type)) {
    return new NextResponse(null, { status: 400 });
  }
  // IP — только чтобы определить город; в памяти и в сводке его нет.
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip');
  recordVisit(event, userAgent, ip);
  return new NextResponse(null, { status: 204 });
}
