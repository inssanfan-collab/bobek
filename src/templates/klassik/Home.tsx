import Link from 'next/link';
import { pick } from '@/lib/i18n';
import { withLocale } from '@/server/tenant/context';
import {
  AnnouncementList, ContactCard, GalleryStrip, NewsCard, PlacesBadge, SectionTiles, T,
} from '@/components/site/blocks';
import type { HomeProps } from '../types';

/** Классик: строгая шапка-баннер, новости колонкой, плитки разделов. */
export function KlassikHome({ profile, sections, news, announcements, albums, locale, coverUrl }: HomeProps) {
  const name = pick(locale, profile?.nameKk, profile?.nameRu);
  const about = pick(locale, profile?.aboutKk, profile?.aboutRu);

  return (
    <div className="container-page space-y-12 py-8">
      <section className="overflow-hidden rounded-3xl border border-line bg-card">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl} alt="" className="h-56 w-full object-cover sm:h-72" />
        ) : (
          <div className="h-56 bg-gradient-to-r from-brand to-accent sm:h-72" aria-hidden />
        )}
        <div className="p-6 sm:p-8">
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl">{name}</h1>
          {about ? <p className="mt-3 max-w-3xl text-muted">{about}</p> : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <PlacesBadge profile={profile} locale={locale} />
            {profile?.langKk ? <span className="badge bg-brand-soft text-brand-ink">Қазақша</span> : null}
            {profile?.langRu ? <span className="badge bg-brand-soft text-brand-ink">Русский</span> : null}
          </div>
        </div>
      </section>

      <AnnouncementList items={announcements} locale={locale} />

      {news.length > 0 ? (
        <section>
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-extrabold">{T.news[locale]}</h2>
            <Link href={withLocale('/news', locale)} className="btn-ghost text-sm">{T.allNews[locale]} →</Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((post) => <NewsCard key={post.id} post={post} locale={locale} />)}
          </div>
        </section>
      ) : null}

      <SectionTiles sections={sections} locale={locale} />
      <GalleryStrip albums={albums} locale={locale} />
      <ContactCard profile={profile} locale={locale} />
    </div>
  );
}
