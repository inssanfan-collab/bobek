import Link from 'next/link';
import { prisma } from '@/server/db';
import { requireSuperadmin } from '@/server/auth/guards';
import { PageHeader } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateTime } from '@/lib/labels';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Балабақшалардың жарияланымдары', ru: 'Публикации садов' },
  lead: {
    kk: 'Барлық сайттардағы соңғы жарияланған материалдар.',
    ru: 'Последние опубликованные материалы со всех сайтов.',
  },
  empty: { kk: 'Әзірге жарияланымдар жоқ', ru: 'Публикаций пока нет' },
} as const;

/** Лента публикаций всех садов — быстрый способ заметить неуместный контент. */
export default async function FeedPage() {
  const user = await requireSuperadmin();
  const locale = user.locale;

  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    include: { tenant: { include: { profile: true, domains: { where: { isPrimary: true }, take: 1 } } } },
    orderBy: { publishedAt: 'desc' },
    take: 60,
  });

  return (
    <>
      <PageHeader title={T.title[locale]} description={T.lead[locale]} />
      {posts.length === 0 ? (
        <EmptyState icon="📰" title={T.empty[locale]} />
      ) : (
        <div className="card divide-y divide-line">
          {posts.map((post) => {
            const host = post.tenant.domains[0]?.host;
            return (
              <div key={post.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{post.titleRu || post.titleKk}</p>
                  <p className="text-sm text-muted">
                    <Link href={`/admin/tenants/${post.tenantId}`} className="hover:text-brand">
                      {post.tenant.profile?.nameRu ?? post.tenant.slug}
                    </Link>
                    {' · '}
                    {formatDateTime(post.publishedAt)}
                  </p>
                </div>
                {host ? (
                  <a href={`https://${host}`} target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm">
                    На сайте →
                  </a>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
