import Link from 'next/link';
import { pick } from '@/lib/i18n';
import { withLocale } from '@/server/tenant/context';
import {
  AnnouncementList, ContactCard, GalleryStrip, NewsCard, PlacesBadge, SectionTiles, T,
} from '@/components/site/blocks';
import type { HomeProps } from '../types';

/** Ертегі: мягкая волна вместо прямой границы, крупные скругления, тёплый тон. */
export function ErtegiHome({ profile, sections, news, announcements, albums, locale, coverUrl }: HomeProps) {
  const name = pick(locale, profile?.nameKk, profile?.nameRu);
  const about = pick(locale, profile?.aboutKk, profile?.aboutRu);

  return (
    <>
      <section className="relative overflow-hidden bg-brand-soft">
        <div className="decor pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand/20 blur-2xl" aria-hidden />
        <div className="container-page relative grid gap-8 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
          <div>
            <h1 className="font-display text-4xl font-extrabold text-brand-ink sm:text-5xl">{name}</h1>
            {about ? <p className="mt-4 max-w-xl text-lg text-brand-ink/80">{about}</p> : null}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <PlacesBadge profile={profile} locale={locale} />
              {profile?.phone ? (
                <a href={`tel:${profile.phone.replace(/\s/g, '')}`} className="btn-primary">
                  {profile.phone}
                </a>
              ) : null}
            </div>
          </div>
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="" className="h-64 w-full rounded-3xl object-cover shadow-lift lg:h-full" />
          ) : (
            <div className="h-64 rounded-3xl bg-gradient-to-br from-brand to-accent shadow-lift lg:h-full" aria-hidden />
          )}
        </div>
        <svg className="decor block h-12 w-full text-surface" viewBox="0 0 1440 48" preserveAspectRatio="none" aria-hidden>
          <path d="M0 48h1440V12c-240 32-480 32-720 12S240 0 0 24z" fill="currentColor" />
        </svg>
      </section>

      <div className="container-page space-y-12 py-8">
        <AnnouncementList items={announcements} locale={locale} />
        <SectionTiles sections={sections} locale={locale} />

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

        <GalleryStrip albums={albums} locale={locale} />
        <ContactCard profile={profile} locale={locale} />
      </div>
    </>
  );
}
