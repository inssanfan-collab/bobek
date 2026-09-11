import Link from 'next/link';
import { pick } from '@/lib/i18n';
import { withLocale } from '@/server/tenant/context';
import {
  AnnouncementList, ContactCard, GalleryStrip, NewsCard, PlacesBadge, SectionTiles, T,
} from '@/components/site/blocks';
import type { HomeProps } from '../types';

/**
 * Алатау: две колонки на всю страницу — слева содержимое, справа карточка
 * сада, которая едет вместе с прокруткой. Для садов, где родителю нужны
 * телефон и свободные места на любом экране, а не только в самом верху.
 */
export function AlatauHome({ profile, sections, news, announcements, albums, locale, coverUrl }: HomeProps) {
  const name = pick(locale, profile?.nameKk, profile?.nameRu);
  const about = pick(locale, profile?.aboutKk, profile?.aboutRu);

  return (
    <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_20rem] lg:items-start">
      <div className="space-y-10">
        <section>
          <h1 className="font-display text-4xl font-extrabold sm:text-5xl">{name}</h1>
          {about ? <p className="mt-4 max-w-2xl text-lg text-muted">{about}</p> : null}
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="" className="mt-6 h-64 w-full rounded-3xl object-cover shadow-soft sm:h-80" />
          ) : (
            <div
              className="mt-6 h-64 rounded-3xl bg-gradient-to-br from-brand-soft to-accent-soft sm:h-80"
              aria-hidden
            />
          )}
        </section>

        <AnnouncementList items={announcements} locale={locale} />

        {news.length > 0 ? (
          <section>
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-display text-2xl font-extrabold">{T.news[locale]}</h2>
              <Link href={withLocale('/news', locale)} className="btn-ghost text-sm">
                {T.allNews[locale]} →
              </Link>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {news.map((post) => (
                <NewsCard key={post.id} post={post} locale={locale} />
              ))}
            </div>
          </section>
        ) : null}

        <SectionTiles sections={sections} locale={locale} />
        <GalleryStrip albums={albums} locale={locale} />
      </div>

      {/* Боковая колонка: на узком экране просто уходит вниз */}
      <aside className="space-y-5 lg:sticky lg:top-24">
        <div className="card p-6">
          <PlacesBadge profile={profile} locale={locale} />
          {profile?.phone ? (
            <a
              href={`tel:${profile.phone.replace(/\s/g, '')}`}
              className="btn-primary mt-4 w-full"
            >
              {profile.phone}
            </a>
          ) : null}
          {profile?.workHours ? (
            <p className="mt-4 text-sm text-muted">{profile.workHours}</p>
          ) : null}
        </div>
        <ContactCard profile={profile} locale={locale} />
      </aside>
    </div>
  );
}
