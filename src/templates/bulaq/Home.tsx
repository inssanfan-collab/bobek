import Link from 'next/link';
import { pick } from '@/lib/i18n';
import { withLocale } from '@/server/tenant/context';
import {
  AnnouncementList, ContactCard, GalleryStrip, NewsCard, PlacesBadge, SectionTiles, T,
} from '@/components/site/blocks';
import type { HomeProps } from '../types';

/**
 * Бұлақ: обложка во весь экран, название поверх неё, под ней — лента
 * с самым важным. Расчёт на сады, у которых есть хорошая фотография здания
 * или площадки: она становится лицом сайта, а не полоской сверху.
 */
export function BulaqHome({ profile, sections, news, announcements, albums, locale, coverUrl }: HomeProps) {
  const name = pick(locale, profile?.nameKk, profile?.nameRu);
  const about = pick(locale, profile?.aboutKk, profile?.aboutRu);

  return (
    <>
      <section className="relative isolate overflow-hidden">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand via-brand to-accent" aria-hidden />
        )}
        {/* Затемнение обязательно: текст ложится на чужую фотографию,
            и без него читаемость зависит от того, что сад загрузил. */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/45 to-black/20" aria-hidden />

        <div className="container-page flex min-h-[22rem] flex-col justify-end py-12 text-white sm:min-h-[28rem]">
          <h1 className="max-w-3xl font-display text-4xl font-extrabold drop-shadow sm:text-5xl">{name}</h1>
          {about ? <p className="mt-4 max-w-2xl text-lg text-white/90 drop-shadow">{about}</p> : null}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <PlacesBadge profile={profile} locale={locale} />
            {profile?.phone ? (
              <a
                href={`tel:${profile.phone.replace(/\s/g, '')}`}
                className="rounded-full bg-white px-5 py-2.5 font-bold text-ink transition hover:-translate-y-0.5"
              >
                {profile.phone}
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <div className="container-page space-y-12 py-10">
        <AnnouncementList items={announcements} locale={locale} />
        <SectionTiles sections={sections} locale={locale} />

        {news.length > 0 ? (
          <section>
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-display text-2xl font-extrabold">{T.news[locale]}</h2>
              <Link href={withLocale('/news', locale)} className="btn-ghost text-sm">
                {T.allNews[locale]} →
              </Link>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {news.map((post) => (
                <NewsCard key={post.id} post={post} locale={locale} />
              ))}
            </div>
          </section>
        ) : null}

        <GalleryStrip albums={albums} locale={locale} />
        <ContactCard profile={profile} locale={locale} />
      </div>
    </>
  );
}
