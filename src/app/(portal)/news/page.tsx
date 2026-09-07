import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/server/db';
import { formatDate } from '@/lib/labels';
import { EmptyState } from '@/components/ui/EmptyState';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Новости портала' };

export default async function PortalNewsPage() {
  const posts = await prisma.portalPost.findMany({
    where: { status: 'PUBLISHED', publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: 'desc' },
    take: 30,
  });

  return (
    <div className="container-page py-12">
      <h1 className="font-display text-4xl font-extrabold">Новости</h1>

      {posts.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon="📰" title="Новостей пока нет" description="Здесь будут появляться новости портала и системы дошкольного образования области." />
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {posts.map((post) => (
            <article key={post.id} className="card p-6">
              <p className="text-sm text-muted">{formatDate(post.publishedAt)}</p>
              <h2 className="mt-1 font-display text-xl font-bold">
                <Link href={`/news/${post.slug}`} className="hover:text-brand">{post.titleRu}</Link>
              </h2>
              {post.excerptRu ? <p className="mt-2 text-muted">{post.excerptRu}</p> : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
