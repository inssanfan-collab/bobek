import type { Metadata } from 'next';
import { prisma } from '@/server/db';
import { formatDate } from '@/lib/labels';
import { SalesPage } from '@/components/portal/sales/SalesChrome';
import { localeFromParam, pick, withLocale } from '@/lib/i18n';
import { portalAlternates } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const locale = localeFromParam((await searchParams).lang);
  return {
    alternates: portalAlternates('/news', locale),
    title: locale === 'kk' ? 'Жаңалықтар' : 'Новости',
    description: locale === 'kk'
      ? 'EduSad жаңалықтары: жаңа дизайндар, әкімші бөлімінің мүмкіндіктері және балабақша сайттарына қатысты өзгерістер.'
      : 'Новости EduSad: новые дизайны, возможности админки и изменения, которые касаются сайтов детских садов.',
  };
}

const T = {
  title: { kk: 'Жаңалықтар', ru: 'Новости' },
  lead: {
    kk: 'Жаңа дизайндар, әкімші бөлімінің мүмкіндіктері және балабақша сайттарына қатысты өзгерістер.',
    ru: 'Новые дизайны, возможности админки и изменения, которые касаются сайтов детских садов.',
  },
  empty: { kk: 'Әзірге жаңалықтар жоқ', ru: 'Новостей пока нет' },
  read: { kk: 'Оқу →', ru: 'Читать →' },
} as const;

export default async function PortalNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = localeFromParam((await searchParams).lang);

  const posts = await prisma.portalPost.findMany({
    where: { status: 'PUBLISHED', publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: 'desc' },
    take: 30,
  });

  return (
    <SalesPage locale={locale} pathname="/news" title={T.title[locale]} lead={T.lead[locale]}>
      {posts.length === 0 ? (
        <p className="note">{T.empty[locale]}</p>
      ) : (
        <div className="nw-list">
          {posts.map((post) => {
            const href = withLocale(`/news/${post.slug}`, locale);
            const excerpt = pick(locale, post.excerptKk, post.excerptRu);
            return (
              <article key={post.id} className="nw-item">
                <time dateTime={post.publishedAt?.toISOString()}>{formatDate(post.publishedAt, locale)}</time>
                <h2><a href={href}>{pick(locale, post.titleKk, post.titleRu)}</a></h2>
                {excerpt ? <p>{excerpt}</p> : null}
                <a href={href} className="nw-more" aria-hidden="true" tabIndex={-1}>{T.read[locale]}</a>
              </article>
            );
          })}
        </div>
      )}
    </SalesPage>
  );
}
