import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/server/db';
import { formatDate } from '@/lib/labels';
import { toPlainText } from '@/lib/sanitize';
import { PortalPage } from '@/components/portal/PortalChrome';
import { localeFromParam, pick, withLocale } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

const T = {
  notFound: { kk: 'Жаңалық табылмады', ru: 'Новость не найдена' },
  allNews: { kk: '← Барлық жаңалықтар', ru: '← Все новости' },
} as const;

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
  if (!post) return { title: T.notFound.ru };
  return {
    title: post.titleRu,
    description: post.excerptRu ?? toPlainText(post.bodyRu, 160),
  };
}

export default async function PortalNewsItem({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const [{ slug }, search] = await Promise.all([params, searchParams]);
  const locale = localeFromParam(search.lang);

  const post = await load(slug);
  if (!post) notFound();

  const body = pick(locale, post.bodyKk, post.bodyRu);

  return (
    <PortalPage locale={locale} pathname={`/news/${slug}`}>
      <article className="container-page max-w-3xl py-12">
        <Link href={withLocale('/news', locale)} className="text-sm font-semibold text-brand">
          {T.allNews[locale]}
        </Link>
        <p className="mt-4 text-sm text-muted">{formatDate(post.publishedAt, locale)}</p>
        <h1 className="mt-1 font-display text-4xl font-extrabold">{pick(locale, post.titleKk, post.titleRu)}</h1>
        {body ? <div className="prose-content mt-6" dangerouslySetInnerHTML={{ __html: body }} /> : null}
      </article>
    </PortalPage>
  );
}
