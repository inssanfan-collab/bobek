import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/server/db';
import { formatDate } from '@/lib/labels';
import { toPlainText } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

async function load(slug: string) {
  return prisma.portalPost.findFirst({
    where: { slug, status: 'PUBLISHED', publishedAt: { lte: new Date() } },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const post = await load((await params).slug);
  if (!post) return { title: 'Новость не найдена' };
  return {
    title: post.titleRu,
    description: post.excerptRu ?? toPlainText(post.bodyRu, 160),
  };
}

export default async function PortalNewsItem({ params }: { params: Promise<{ slug: string }> }) {
  const post = await load((await params).slug);
  if (!post) notFound();

  return (
    <article className="container-page max-w-3xl py-12">
      <Link href="/news" className="text-sm font-semibold text-brand">← Все новости</Link>
      <p className="mt-4 text-sm text-muted">{formatDate(post.publishedAt)}</p>
      <h1 className="mt-1 font-display text-4xl font-extrabold">{post.titleRu}</h1>
      {post.bodyRu ? (
        <div className="prose-content mt-6" dangerouslySetInnerHTML={{ __html: post.bodyRu }} />
      ) : null}
    </article>
  );
}
