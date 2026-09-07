import Link from 'next/link';
import { prisma } from '@/server/db';
import { requireSuperadmin } from '@/server/auth/guards';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { formatDate } from '@/lib/labels';
import { deletePortalPost } from './actions';

export const dynamic = 'force-dynamic';

export default async function PortalNewsAdmin() {
  await requireSuperadmin();
  const [posts, csrf] = await Promise.all([
    prisma.portalPost.findMany({ orderBy: [{ publishedAt: 'desc' }, { updatedAt: 'desc' }] }),
    csrfToken(),
  ]);

  return (
    <>
      <PageHeader
        title="Новости портала"
        description="Публикуются на bobegim.kz/news — это не новости садов."
        action={<Link href="/admin/news/new" className="btn-primary">Добавить</Link>}
      />

      {posts.length === 0 ? (
        <EmptyState
          icon="📰"
          title="Новостей портала нет"
          description="Расскажите о запуске, изменениях в тарифе или новостях системы образования области."
          action={<Link href="/admin/news/new" className="btn-primary mt-2">Написать</Link>}
        />
      ) : (
        <div className="card divide-y divide-line">
          {posts.map((post) => (
            <div key={post.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
              <Link href={`/admin/news/${post.id}`} className="min-w-0 flex-1 truncate font-semibold hover:text-brand">
                {post.titleRu}
              </Link>
              <span className={`badge ${post.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {post.status === 'PUBLISHED' ? 'опубликовано' : 'черновик'}
              </span>
              <span className="text-sm text-muted">{formatDate(post.publishedAt ?? post.updatedAt)}</span>
              <form action={deletePortalPost}>
                <input type="hidden" name={CSRF_FIELD} value={csrf} />
                <input type="hidden" name="id" value={post.id} />
                <button type="submit" className="btn-ghost px-3 py-1.5 text-xs text-red-600">Удалить</button>
              </form>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
