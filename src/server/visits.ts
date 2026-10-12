import 'server-only';
import { prisma } from '@/server/db';
import { sendTelegram } from '@/server/notify/telegram';
import { deviceName } from '@/lib/presence';
import { sourceOf } from '@/lib/visit-source';
import { cityOf } from '@/server/geo';

/**
 * Посетители продающих страниц портала — сообщение владельцу в Telegram
 * (решение владельца 11.10.2026): кто пришёл, откуда, что смотрел, дошёл ли
 * до заявки. Кто именно — неизвестно: имени и телефона сайт не знает,
 * пока человек сам не оставит заявку.
 *
 * Страница (VisitTracker) шлёт в /api/visit шаги: открыл страницу, дошёл до
 * тарифов, начал заполнять заявку, отправил, — и раз в 15 секунд «ещё здесь».
 * Посещение копится в памяти; 2 минуты тишины — оно закончено, и если было
 * интересным (дольше 30 секунд или открыты тарифы, дизайны, аттестация,
 * заявка), уходит одно сообщение. Перезапуск сайта теряет незаконченные
 * посещения — для такой сводки это не страшно.
 */

export type VisitEvent = {
  sid: string;
  vid: string;
  type: 'page' | 'ping' | 'mark';
  path?: string;
  title?: string;
  mark?: string;
  lang?: string;
  referrer?: string;
  landing?: string;
};

type Visit = {
  vid: string;
  start: number;
  last: number;
  pages: { path: string; title: string }[];
  marks: Set<string>;
  referrer: string;
  landing: string;
  lang: string;
  userAgent: string;
  /** Город по IP — сам адрес не храним. */
  city: string;
};

const IDLE_MS = 2 * 60_000;
const INTERESTING_MS = 30_000;
const MAX_VISITS = 500;
const MAX_PAGES = 30;

const visits = ((globalThis as { __edusadVisits?: Map<string, Visit> }).__edusadVisits ??= new Map());

/** Что считается «заинтересовался»: эти страницы или разделы главной. */
const INTEREST_PATHS = /^\/(designs|attestaciya|offer|guide|contacts)\b/;
const MARK_LABEL: Record<string, string> = {
  tarify: 'дошёл до тарифов',
  vid: 'смотрел, как выглядит сайт',
  adminka: 'смотрел админку',
  voprosy: 'читал вопросы',
  zayavka: 'дошёл до формы заявки',
  form: 'начал заполнять заявку',
  lead: 'оставил заявку ✅',
  phone: 'нажал на телефон',
  live: 'открыл дизайн вживую',
};

export function recordVisit(event: VisitEvent, userAgent: string, ip: string | null): void {
  const now = Date.now();
  let visit = visits.get(event.sid);
  if (!visit) {
    if (event.type !== 'page' || visits.size >= MAX_VISITS) return;
    visit = {
      vid: event.vid,
      start: now,
      last: now,
      pages: [],
      marks: new Set(),
      referrer: (event.referrer ?? '').slice(0, 300),
      landing: (event.landing ?? event.path ?? '').slice(0, 300),
      lang: event.lang === 'kk' ? 'kk' : 'ru',
      userAgent: userAgent.slice(0, 300),
      city: '',
    };
    visits.set(event.sid, visit);
    const created = visit;
    void cityOf(ip).then((city) => { created.city = city; }).catch(() => undefined);
  }
  visit.last = now;
  if (event.type === 'page' && event.path && visit.pages.length < MAX_PAGES) {
    const previous = visit.pages[visit.pages.length - 1];
    if (previous?.path !== event.path) visit.pages.push({ path: event.path.slice(0, 200), title: (event.title ?? '').slice(0, 120) });
  }
  if (event.type === 'mark' && event.mark && MARK_LABEL[event.mark]) visit.marks.add(event.mark);
  ensureTimer();
}

let timer: ReturnType<typeof setInterval> | null = null;
function ensureTimer() {
  if (timer) return;
  timer = setInterval(() => void flush(), 30_000);
  timer.unref?.();
}

async function flush(): Promise<void> {
  const now = Date.now();
  for (const [sid, visit] of visits) {
    if (now - visit.last < IDLE_MS) continue;
    visits.delete(sid);
    if (isInteresting(visit)) await report(visit).catch((error) => console.error('[visits]', (error as Error).message));
  }
}

function isInteresting(visit: Visit): boolean {
  return (
    visit.last - visit.start >= INTERESTING_MS ||
    visit.marks.size > 0 ||
    visit.pages.some((page) => INTEREST_PATHS.test(page.path))
  );
}

function duration(ms: number): string {
  const seconds = Math.round(ms / 1000);
  return seconds < 60 ? `${seconds} с` : `${Math.floor(seconds / 60)} мин ${seconds % 60} с`;
}

const escapeHtml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Название страницы без хвоста « · EduSad» / « | EduSad». */
function pageLabel(page: { path: string; title: string }): string {
  if (page.path === '/' || page.path.startsWith('/?')) return 'главная';
  const title = page.title.replace(/\s*[·|—-]\s*EduSad\s*$/i, '').trim();
  return title || page.path;
}

async function report(visit: Visit): Promise<void> {
  const owners = await prisma.user.findMany({
    where: { role: 'SUPERADMIN', isActive: true, telegramChatId: { not: null } },
    select: { telegramChatId: true },
  });
  if (owners.length === 0) return;

  const known = await prisma.portalVisitor.upsert({
    where: { id: visit.vid },
    create: { id: visit.vid, visits: 1 },
    update: { visits: { increment: 1 }, lastSeenAt: new Date() },
  });

  const lead = visit.marks.has('lead');
  const lines = [
    `${lead ? '✅' : '🟢'} <b>Посетитель на edusad.kz</b> — ${duration(visit.last - visit.start)}`,
    ...(visit.city ? [`📍 ${escapeHtml(visit.city)}`] : []),
    `📱 ${escapeHtml(deviceName(visit.userAgent))} · язык: ${visit.lang === 'kk' ? 'казахский' : 'русский'}`,
    `🔎 Откуда: ${escapeHtml(sourceOf(visit.referrer, visit.landing))}`,
    `👣 ${escapeHtml(visit.pages.map(pageLabel).join(' → ') || 'главная')}`,
  ];
  const marks = [...visit.marks].map((mark) => MARK_LABEL[mark]).filter(Boolean);
  if (marks.length) lines.push(`⭐ ${escapeHtml(marks.join(', '))}`);
  lines.push(
    known.visits > 1
      ? `🔁 Заходит уже ${known.visits}-й раз (первый — ${known.firstSeenAt.toLocaleDateString('ru-RU', { timeZone: 'Asia/Almaty' })})`
      : '🆕 Первый раз',
  );

  for (const owner of owners) await sendTelegram(owner.telegramChatId!, lines.join('\n'));
}
