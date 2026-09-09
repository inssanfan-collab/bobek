import Link from 'next/link';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { PageHeader, StatCard } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { statsSummary } from '@/server/stats';
import { formatDate } from '@/lib/labels';
import { pick } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Сайтқа кірулер', ru: 'Посещаемость' },
  lead: {
    kk: 'Сайтыңыздың беттері неше рет ашылды. Cookie мен келушілерді бақылаусыз санаймыз.',
    ru: 'Сколько раз открывали страницы вашего сайта. Считаем без cookie и слежки за посетителями.',
  },
  days30: { kk: '30 күнде', ru: 'За 30 дней' },
  week: { kk: 'Аптада', ru: 'За неделю' },
  today: { kk: 'Бүгін', ru: 'Сегодня' },
  best: { kk: 'Ең жақсы күн', ru: 'Лучший день' },
  empty: { kk: 'Әзірге кірулер болған жоқ', ru: 'Посещений пока не было' },
  emptyHint: {
    kk: 'Ата-аналарға сайттың мекенжайын айтыңыз — ата-аналар чатына жазыңыз, кіреберістегі стендке іліңіз.',
    ru: 'Расскажите родителям адрес сайта — напишите его в родительском чате и на стенде у входа.',
  },
  byDays: { kk: 'Ай ішіндегі күндер бойынша', ru: 'По дням за месяц' },
  chartLabel: { kk: '30 күндегі кірулер графигі', ru: 'График посещаемости за 30 дней' },
  topHeading: { kk: 'Ең көп оқылатыны', ru: 'Что читают чаще всего' },
  views: { kk: 'қаралым', ru: 'просмотров' },
  topHint: {
    kk: 'Ата-аналарды не қызықтыратыны түсінікті — мұндай жарияланымдарды көбірек жасаған жөн.',
    ru: 'Понятно, что интересует родителей, — таких публикаций стоит делать больше.',
  },
} as const;

const WEEKDAYS = {
  ru: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
  kk: ['жс', 'дс', 'сс', 'ср', 'бс', 'жм', 'сб'],
} as const;

export default async function StatsPage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);
  const locale = ctx.user.locale;

  const [stats, topPosts] = await Promise.all([
    statsSummary(ctx.tenantId, 30),
    ctx.db.posts.findMany({
      where: { status: 'PUBLISHED', viewCount: { gt: 0 } },
      orderBy: { viewCount: 'desc' },
      take: 10,
      include: { section: true },
    }),
  ]);

  const peak = Math.max(1, ...stats.days.map((day) => day.views));

  return (
    <>
      <PageHeader
        title={T.title[locale]}
        description={T.lead[locale]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={T.days30[locale]} value={stats.total30} />
        <StatCard label={T.week[locale]} value={stats.total7} />
        <StatCard label={T.today[locale]} value={stats.today} />
        <StatCard
          label={T.best[locale]}
          value={stats.best?.views ?? 0}
          hint={stats.best && stats.best.views > 0 ? formatDate(stats.best.date, locale) : undefined}
        />
      </div>

      {stats.total30 === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon="📈"
            title={T.empty[locale]}
            description={T.emptyHint[locale]}
          />
        </div>
      ) : (
        <section className="card mt-8 p-6">
          <h2 className="font-display text-lg font-bold">{T.byDays[locale]}</h2>
          <div className="mt-6 flex h-48 items-end gap-1" role="img" aria-label={T.chartLabel[locale]}>
            {stats.days.map((day) => (
              <div key={day.date.toISOString()} className="group relative flex flex-1 flex-col items-center justify-end">
                <span className="mb-1 text-[10px] font-semibold text-muted opacity-0 transition group-hover:opacity-100">
                  {day.views}
                </span>
                <div
                  className="w-full rounded-t bg-brand transition group-hover:brightness-110"
                  style={{ height: `${Math.max(2, (day.views / peak) * 100)}%` }}
                  title={`${formatDate(day.date, locale)}: ${day.views}`}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-1 text-[10px] text-muted">
            {stats.days.map((day) => (
              <span key={day.date.toISOString()} className="flex-1 text-center">
                {day.date.getUTCDay() === 1 ? WEEKDAYS[locale][day.date.getUTCDay()] : ''}
              </span>
            ))}
          </div>
        </section>
      )}

      {topPosts.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-3 font-display text-lg font-bold">{T.topHeading[locale]}</h2>
          <div className="card divide-y divide-line">
            {topPosts.map((post) => (
              <div key={post.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <Link href={`/admin/posts/${post.id}`} className="min-w-0 flex-1 truncate font-semibold hover:text-brand">
                  {pick(locale, post.titleKk, post.titleRu)}
                </Link>
                <span className="badge bg-brand-soft text-brand-ink">{post.viewCount} {T.views[locale]}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted">
            {T.topHint[locale]}
          </p>
        </section>
      ) : null}
    </>
  );
}
