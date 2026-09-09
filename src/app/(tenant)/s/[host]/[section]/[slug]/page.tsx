import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { publicSiteContext, localeFrom, withLocale } from '@/server/tenant/context';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { UrgentNotice } from '@/components/site/UrgentNotice';
import { recordPostView, recordVisit } from '@/server/stats';
import { mediaUrl } from '@/components/site/blocks';
import { pick } from '@/lib/i18n';
import { toPlainText } from '@/lib/sanitize';
import { formatDate } from '@/lib/labels';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

type Params = { host: string; section: string; slug: string };

/**
 * Одна страница на запись новости/объявления и на альбом галереи:
 * их адрес одинаково строится как /<раздел>/<запись>.
 */
async function load({ host, section: sectionSlug, slug }: Params) {
  const context = await publicSiteContext(host);
  const section = await context.db.sections.findFirst({ where: { slug: sectionSlug, isVisible: true } });
  if (!section) notFound();

  if (section.type === 'GALLERY') {
    const album = await context.db.albums.findFirst({
      where: { slug, isVisible: true },
      include: { items: { orderBy: { position: 'asc' }, include: { media: true } } },
    });
    if (!album) notFound();
    return { context, section, album, post: null };
  }

  const post = await context.db.posts.findFirst({
    where: { slug, sectionId: section.id, status: 'PUBLISHED', publishedAt: { lte: new Date() } },
    include: { coverMedia: true },
  });
  if (!post) notFound();
  return { context, section, post, album: null };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { post, album } = await load(await params);

  if (album) return { title: album.titleRu || album.titleKk };

  const title = post!.titleRu || post!.titleKk;
  const description = post!.excerptRu || toPlainText(post!.bodyRu, 160);
  const cover = post!.coverMedia ? `/api/media/${post!.coverMedia.id}` : undefined;

  return {
    title,
    description,
    // Родители делятся ссылками в WhatsApp — без og-картинки превью выглядит пустым.
    openGraph: { title, description, images: cover ? [cover] : undefined, type: 'article' },
  };
}

export default async function EntryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const [resolvedParams, search] = await Promise.all([params, searchParams]);
  const { context, section, post, album } = await load(resolvedParams);
  const locale = localeFrom(search.lang);
  const basePath = `/${section.slug}`;

  const menu = await context.db.sections.findMany({
    where: { isVisible: true, parentId: null },
    orderBy: { position: 'asc' },
  });

  await recordVisit(context.tenant.id);
  if (post) await recordPostView(post.id);

  return (
    <>
      <UrgentNotice profile={context.profile} locale={locale} />
      <SiteHeader profile={context.profile} sections={menu} locale={locale} pathname={basePath} />

      <main id="main" className="container-page max-w-3xl py-8">
        <Link href={withLocale(basePath, locale)} className="text-sm font-semibold text-brand">
          ← {pick(locale, section.titleKk, section.titleRu)}
        </Link>

        {album ? (
          <>
            <h1 className="mt-4 font-display text-3xl font-extrabold">{pick(locale, album.titleKk, album.titleRu)}</h1>
            {album.takenOn ? <p className="mt-1 text-sm text-muted">{formatDate(album.takenOn, locale)}</p> : null}
            {pick(locale, album.descKk, album.descRu) ? (
              <p className="mt-3 text-muted">{pick(locale, album.descKk, album.descRu)}</p>
            ) : null}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {album.items.map((item) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={item.id}
                  src={mediaUrl(item.media) ?? ''}
                  alt={pick(locale, item.media.altKk, item.media.altRu)}
                  className="w-full rounded-2xl object-cover"
                  loading="lazy"
                />
              ))}
            </div>
          </>
        ) : (
          <article>
            <p className="mt-4 text-sm text-muted">{formatDate(post!.publishedAt, locale)}</p>
            <h1 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">
              {pick(locale, post!.titleKk, post!.titleRu)}
            </h1>
            {post!.coverMedia ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mediaUrl(post!.coverMedia) ?? ''}
                alt=""
                className="mt-6 w-full rounded-3xl object-cover"
              />
            ) : null}
            <div
              className="prose-content mt-6"
              dangerouslySetInnerHTML={{
                __html: (locale === 'kk' ? post!.bodyKk || post!.bodyRu : post!.bodyRu || post!.bodyKk) ?? '',
              }}
            />
          </article>
        )}
      </main>

      <SiteFooter profile={context.profile} sections={menu} locale={locale} portalDomain={env.portalDomain} />
    </>
  );
}
