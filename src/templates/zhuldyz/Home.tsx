import Link from 'next/link';
import { withLocale } from '@/server/tenant/context';
import {
  AnnouncementList, ContactCard, GalleryStrip, NewsCard, PlacesBadge, SectionTiles, T,
} from '@/components/site/blocks';
import { HeroButtons, HeroTitle } from '@/components/site/Hero';
import type { HomeProps } from '../types';

/** Жұлдыз: обложка во весь экран, первая новость крупной карточкой. */
export function ZhuldyzHome({ profile, sections, news, announcements, albums, locale, coverUrl, coverPosition, showContacts, hero }: HomeProps) {
  // Крупная первая новость занимает две колонки из трёх: с ней ровно
  // заполняют ряды 1 + 4 карточки, шестая оставалась бы в ряду одна.
  const [lead, ...others] = news;
  const rest = others.slice(0, 4);

  return (
    <>
      <section className="relative isolate">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl} alt="" style={{ objectPosition: coverPosition }} className="absolute inset-0 -z-10 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand via-brand to-accent" aria-hidden />
        )}
        <div className="absolute inset-0 -z-10 bg-black/45" aria-hidden />

        <div className="container-page flex min-h-[22rem] flex-col justify-end py-12 text-white sm:min-h-[28rem]">
          <HeroTitle hero={hero} tone="light" className="max-w-3xl font-display text-4xl font-extrabold drop-shadow sm:text-5xl" />
          {hero.lead ? <p className="mt-4 max-w-2xl text-lg text-white/90 drop-shadow">{hero.lead}</p> : null}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <PlacesBadge profile={profile} locale={locale} />
            <HeroButtons hero={hero} tone="light" />
          </div>
        </div>
      </section>

      <div className="container-page space-y-12 py-10">
        <AnnouncementList items={announcements} locale={locale} />

        {news.length > 0 ? (
          <section>
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-display text-2xl font-extrabold">{T.news[locale]}</h2>
              <Link href={withLocale('/news', locale)} className="btn-ghost text-sm">{T.allNews[locale]} →</Link>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lead ? <NewsCard post={lead} locale={locale} featured /> : null}
              {rest.map((post) => <NewsCard key={post.id} post={post} locale={locale} />)}
            </div>
          </section>
        ) : null}

        <GalleryStrip albums={albums} locale={locale} />
        <SectionTiles sections={sections} locale={locale} />
        {showContacts ? <ContactCard profile={profile} locale={locale} /> : null}
      </div>
    </>
  );
}
