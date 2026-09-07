import Link from 'next/link';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { formatDate } from '@/lib/labels';
import { deletePost } from '../actions';
import type { SectionType } from '@prisma/client';

export const dynamic = 'force-dynamic';

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
  const title = isNews ? 'Новости' : 'Объявления';

  if (!section) {
    return (
      <>
        <PageHeader title={title} />
        <EmptyState
          icon="🧭"
          title={`Раздел «${title}» отключён`}
          description="Включите его в разделе «Разделы меню», чтобы публиковать материалы."
          action={<Link href="/admin/sections" className="btn-primary mt-2">Открыть разделы</Link>}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={title}
        description={isNews ? 'Утренники, конкурсы, будни групп.' : 'Короткие срочные сообщения для родителей.'}
        action={
          ctx.canEdit ? (
            <Link href={`/admin/posts/new?type=${type}`} className="btn-primary">Добавить</Link>
          ) : null
        }
      />

      {posts.length === 0 ? (
        <EmptyState
          icon={isNews ? '📰' : '📢'}
          title="Пока ничего не опубликовано"
          description="Первая публикация — самый быстрый способ показать родителям, что сайт живой."
          action={ctx.canEdit ? <Link href={`/admin/posts/new?type=${type}`} className="btn-primary mt-2">Написать</Link> : undefined}
        />
      ) : (
        <div className="card divide-y divide-line">
          {posts.map((post) => (
            <div key={post.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
              <Link href={`/admin/posts/${post.id}`} className="min-w-0 flex-1 truncate font-semibold hover:text-brand">
                {post.titleRu || post.titleKk}
              </Link>
              {post.isPinned ? <span className="badge bg-brand-soft text-brand-ink">закреплено</span> : null}
              <span className={`badge ${post.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {post.status === 'PUBLISHED' ? 'опубликовано' : 'черновик'}
              </span>
              <span className="text-sm text-muted">{formatDate(post.publishedAt ?? post.updatedAt)}</span>
              {ctx.canEdit ? (
                <form action={deletePost}>
                  <input type="hidden" name={CSRF_FIELD} value={csrf} />
                  <input type="hidden" name="host" value={host} />
                  <input type="hidden" name="id" value={post.id} />
                  <button type="submit" className="btn-ghost px-3 py-1.5 text-xs text-red-600">Удалить</button>
                </form>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
