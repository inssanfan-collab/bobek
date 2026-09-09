import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/server/db';
import { formatDate } from '@/lib/labels';
import { EmptyState } from '@/components/ui/EmptyState';
import { PortalPage } from '@/components/portal/PortalChrome';
import { localeFromParam, pick, withLocale } from '@/lib/i18n';

export const dynamic = 'force-dynamic';
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const locale = localeFromParam((await searchParams).lang);
  return {
    title: locale === 'kk' ? 'Портал жаңалықтары' : 'Новости портала',
  };
}

const T = {
  title: { kk: 'Жаңалықтар', ru: 'Новости' },
  empty: { kk: 'Әзірге жаңалықтар жоқ', ru: 'Новостей пока нет' },
  emptyHint: {
    kk: 'Мұнда портал мен облыстың мектепке дейінгі білім жүйесінің жаңалықтары шығады.',
    ru: 'Здесь будут появляться новости портала и системы дошкольного образования области.',
  },
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
    <PortalPage locale={locale} pathname="/news">
      <div className="container-page py-12">
        <h1 className="font-display text-4xl font-extrabold">{T.title[locale]}</h1>

        {posts.length === 0 ? (
          <div className="mt-8">
            <EmptyState icon="📰" title={T.empty[locale]} description={T.emptyHint[locale]} />
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {posts.map((post) => (
              <article key={post.id} className="card p-6">
                <p className="text-sm text-muted">{formatDate(post.publishedAt, locale)}</p>
                <h2 className="mt-1 font-display text-xl font-bold">
                  <Link href={withLocale(`/news/${post.slug}`, locale)} className="hover:text-brand">
                    {pick(locale, post.titleKk, post.titleRu)}
                  </Link>
                </h2>
                {pick(locale, post.excerptKk, post.excerptRu) ? (
                  <p className="mt-2 text-muted">{pick(locale, post.excerptKk, post.excerptRu)}</p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </PortalPage>
  );
}
