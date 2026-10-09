import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/server/db';
import { formatDate } from '@/lib/labels';
import { toPlainText } from '@/lib/sanitize';
import { SalesPage } from '@/components/portal/sales/SalesChrome';
import { portalUrl } from '@/lib/seo';
import { PhotoZoom } from '@/components/site/PhotoZoom';
import { localeFromParam, pick, withLocale } from '@/lib/i18n';
import { portalAlternates } from '@/lib/seo';
import { env } from '@/lib/env';

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
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const [{ slug }, search] = await Promise.all([params, searchParams]);
  const locale = localeFromParam(search.lang);
  const post = await load(slug);
  if (!post) return { title: T.notFound[locale] };
  return {
    title: pick(locale, post.titleKk, post.titleRu),
    description: pick(locale, post.excerptKk, post.excerptRu) || toPlainText(pick(locale, post.bodyKk, post.bodyRu), 160),
    alternates: portalAlternates(`/news/${slug}`, locale),
    openGraph: { type: 'article', publishedTime: post.publishedAt?.toISOString(), url: portalUrl(`/news/${slug}`, locale) },
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
  const title = pick(locale, post.titleKk, post.titleRu);
  // Разметка статьи для поисковика: дата, автор, издатель.
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    inLanguage: locale,
    mainEntityOfPage: portalUrl(`/news/${slug}`, locale),
    author: { '@type': 'Organization', name: 'EduSad', url: `https://${env.portalDomain}` },
    publisher: { '@type': 'Organization', name: 'EduSad', logo: { '@type': 'ImageObject', url: `https://${env.portalDomain}/apple-touch-icon.png` } },
  };

  return (
    <SalesPage
      locale={locale}
      pathname={`/news/${slug}`}
      title={title}
      lead={
        <>
          <a href={withLocale('/news', locale)} className="nw-back">{T.allNews[locale]}</a>
          <time dateTime={post.publishedAt?.toISOString()} className="nw-date">{formatDate(post.publishedAt, locale)}</time>
        </>
      }
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      {body ? (
        <PhotoZoom locale={locale}>
          <div className="prose-content nw-body" dangerouslySetInnerHTML={{ __html: body }} />
        </PhotoZoom>
      ) : null}
    </SalesPage>
  );
}
