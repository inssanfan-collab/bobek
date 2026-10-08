import 'server-only';
import { headers } from 'next/headers';
import { prisma } from '@/server/db';

const BOT = /bot|crawler|spider|crawling|slurp|facebookexternalhit|preview|monitor|curl|wget|headless/i;

/**
 * Не посещение: бот, превью ссылки или заранее подгруженная страница. Next
 * подгружает страницы по ссылкам, видным на экране (меню, плитки, карточки),
 * — запрос с заголовком Next-Router-Prefetch. Их считали, и сайт с двадцатью
 * пунктами меню «посещали» в десятки раз чаще, чем открывали на самом деле.
 * Переход по ссылке (запрос RSC без этого заголовка) — настоящее посещение.
 */
async function notAVisit(): Promise<boolean> {
  const list = await headers();
  const userAgent = list.get('user-agent') ?? '';
  return !userAgent || BOT.test(userAgent) || list.has('next-router-prefetch') || list.get('purpose') === 'prefetch';
}

/**
 * Учёт посещаемости по дням.
 *
 * Зачем: сад не видит, читает ли кто-нибудь его сайт, и через год не понимает,
 * за что платит. Цифра «сайт посмотрели 340 раз за месяц» — самый честный
 * аргумент за продление.
 *
 * Считаем грубо, без cookie и профилирования посетителей: точная аналитика
 * потребовала бы согласия на обработку данных, а саду хватает порядка величины.
 */
export async function recordVisit(tenantId: string): Promise<void> {
  try {
    if (await notAVisit()) return;

    const now = new Date();
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    await prisma.dailyStat.upsert({
      where: { tenantId_date: { tenantId, date } },
      update: { views: { increment: 1 } },
      create: { tenantId, date, views: 1 },
    });
  } catch (error) {
    // Счётчик не должен ронять страницу сада.
    console.error('[stats] не удалось записать посещение', error);
  }
}

/** Просмотры конкретной публикации — сад видит, какая новость зашла. */
export async function recordPostView(postId: string): Promise<void> {
  try {
    if (await notAVisit()) return;
    await prisma.post.update({ where: { id: postId }, data: { viewCount: { increment: 1 } } });
  } catch {
    /* не критично */
  }
}

export type StatsSummary = {
  days: { date: Date; views: number }[];
  total30: number;
  total7: number;
  today: number;
  best: { date: Date; views: number } | null;
};

export async function statsSummary(tenantId: string, days = 30): Promise<StatsSummary> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - (days - 1));
  since.setUTCHours(0, 0, 0, 0);

  const rows = await prisma.dailyStat.findMany({
    where: { tenantId, date: { gte: since } },
    orderBy: { date: 'asc' },
  });

  const byKey = new Map(rows.map((row) => [row.date.toISOString().slice(0, 10), row.views]));

  // Дни без посещений в таблице отсутствуют — достраиваем, иначе график врёт.
  const series: { date: Date; views: number }[] = [];
  for (let i = 0; i < days; i += 1) {
    const date = new Date(since);
    date.setUTCDate(since.getUTCDate() + i);
    series.push({ date, views: byKey.get(date.toISOString().slice(0, 10)) ?? 0 });
  }

  const total30 = series.reduce((sum, day) => sum + day.views, 0);
  const total7 = series.slice(-7).reduce((sum, day) => sum + day.views, 0);
  const best = series.reduce<{ date: Date; views: number } | null>(
    (top, day) => (day.views > (top?.views ?? 0) ? day : top),
    null,
  );

  return { days: series, total30, total7, today: series.at(-1)?.views ?? 0, best };
}
