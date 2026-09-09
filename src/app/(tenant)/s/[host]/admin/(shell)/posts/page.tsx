import Link from 'next/link';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { formatDate } from '@/lib/labels';
import { pick } from '@/lib/i18n';
import { deletePost } from '../actions';
import type { SectionType } from '@prisma/client';

export const dynamic = 'force-dynamic';

const T = {
  news: { kk: 'Жаңалықтар', ru: 'Новости' },
  announcements: { kk: 'Хабарландырулар', ru: 'Объявления' },
  newsLead: { kk: 'Ертеңгіліктер, байқаулар, топтардың күнделігі.', ru: 'Утренники, конкурсы, будни групп.' },
  announcementsLead: {
    kk: 'Ата-аналарға арналған қысқа шұғыл хабарламалар.',
    ru: 'Короткие срочные сообщения для родителей.',
  },
  sectionOff: { kk: '«%s» бөлімі өшірілген', ru: 'Раздел «%s» отключён' },
  sectionOffHint: {
    kk: 'Материал жариялау үшін оны «Мәзір бөлімдері» ішінде қосыңыз.',
    ru: 'Включите его в разделе «Разделы меню», чтобы публиковать материалы.',
  },
  openSections: { kk: 'Бөлімдерді ашу', ru: 'Открыть разделы' },
  add: { kk: 'Қосу', ru: 'Добавить' },
  empty: { kk: 'Әзірге ештеңе жарияланбаған', ru: 'Пока ничего не опубликовано' },
  emptyHint: {
    kk: 'Алғашқы жарияланым — сайттың тірі екенін ата-аналарға көрсетудің ең жылдам жолы.',
    ru: 'Первая публикация — самый быстрый способ показать родителям, что сайт живой.',
  },
  write: { kk: 'Жазу', ru: 'Написать' },
  pinned: { kk: 'бекітілген', ru: 'закреплено' },
  published: { kk: 'жарияланды', ru: 'опубликовано' },
  draft: { kk: 'жоба', ru: 'черновик' },
  remove: { kk: 'Жою', ru: 'Удалить' },
} as const;

export default async function PostsPage({
  params,
  searchParams,
}: {
  params: Promise<{ host: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const [{ host }, search] = await Promise.all([params, searchParams]);
  const ctx = await tenantAdmin(host);

  const type = (search.type === 'ANNOUNCEMENT' ? 'ANNOUNCEMENT' : 'NEWS') as SectionType;
  const isNews = type === 'NEWS';

  const [posts, section] = await Promise.all([
    ctx.db.posts.findMany({
      where: { section: { type } },
      orderBy: [{ publishedAt: 'desc' }, { updatedAt: 'desc' }],
      include: { section: true },
    }),
    ctx.db.sections.findFirst({ where: { type } }),
  ]);

  const csrf = await csrfToken();
  const locale = ctx.user.locale;
  const title = isNews ? T.news[locale] : T.announcements[locale];

  if (!section) {
    return (
      <>
        <PageHeader title={title} />
        <EmptyState
          icon="🧭"
          title={T.sectionOff[locale].replace('%s', title)}
          description={T.sectionOffHint[locale]}
          action={<Link href="/admin/sections" className="btn-primary mt-2">{T.openSections[locale]}</Link>}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={title}
        description={isNews ? T.newsLead[locale] : T.announcementsLead[locale]}
        action={
          ctx.canEdit ? (
            <Link href={`/admin/posts/new?type=${type}`} className="btn-primary">{T.add[locale]}</Link>
          ) : null
        }
      />

      {posts.length === 0 ? (
        <EmptyState
          icon={isNews ? '📰' : '📢'}
          title={T.empty[locale]}
          description={T.emptyHint[locale]}
          action={ctx.canEdit ? <Link href={`/admin/posts/new?type=${type}`} className="btn-primary mt-2">{T.write[locale]}</Link> : undefined}
        />
      ) : (
        <div className="card divide-y divide-line">
          {posts.map((post) => (
            <div key={post.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
              <Link href={`/admin/posts/${post.id}`} className="min-w-0 flex-1 truncate font-semibold hover:text-brand">
                {pick(locale, post.titleKk, post.titleRu)}
              </Link>
              {post.isPinned ? <span className="badge bg-brand-soft text-brand-ink">{T.pinned[locale]}</span> : null}
              <span className={`badge ${post.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {post.status === 'PUBLISHED' ? T.published[locale] : T.draft[locale]}
              </span>
              <span className="text-sm text-muted">{formatDate(post.publishedAt ?? post.updatedAt)}</span>
              {ctx.canEdit ? (
                <form action={deletePost}>
                  <input type="hidden" name={CSRF_FIELD} value={csrf} />
                  <input type="hidden" name="host" value={host} />
                  <input type="hidden" name="id" value={post.id} />
                  <button type="submit" className="btn-ghost px-3 py-1.5 text-xs text-red-600">{T.remove[locale]}</button>
                </form>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
