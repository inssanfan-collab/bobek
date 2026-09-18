import { pick } from '@/lib/i18n';
import {
  AnnouncementList, ContactCard, GalleryStrip, NewsCard, PlacesBadge, SectionTiles, T,
} from '@/components/site/blocks';
import type { HomeProps } from '@/templates/types';

/**
 * Главная «Образца»: крупная надпись на цветной полосе, под ней обложка
 * с наплывом, дальше — новости в две колонки и разделы. Собрана из тех же
 * блоков, что и стандартные шаблоны: своя тут только раскладка.
 */
export function ObrazecHome({ profile, sections, news, announcements, albums, locale, coverUrl, coverPosition, showContacts }: HomeProps) {
  const name = pick(locale, profile?.nameKk, profile?.nameRu);
  const about = pick(locale, profile?.aboutKk, profile?.aboutRu);

  return (
    <>
      <section className="obrazec-hero">
        <div className="container-page py-12 text-center sm:py-16">
          <h1 className="mx-auto max-w-3xl font-display text-3xl font-extrabold sm:text-5xl">{name}</h1>
          {about ? <p className="mx-auto mt-4 max-w-2xl text-lg opacity-90">{about}</p> : null}
          <div className="mt-5 flex justify-center">
            <PlacesBadge profile={profile} locale={locale} />
          </div>
        </div>
      </section>

      <div className="container-page space-y-12 pb-8">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt=""
            style={{ objectPosition: coverPosition }}
            className="obrazec-cover relative -mt-8 h-56 w-full object-cover sm:h-80"
          />
        ) : null}

        <AnnouncementList items={announcements} locale={locale} />

        {news.length > 0 ? (
          <section>
            <h2 className="obrazec-heading font-display text-2xl font-extrabold">{T.news[locale]}</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {news.slice(0, 4).map((post) => (
                <NewsCard key={post.id} post={post} locale={locale} />
              ))}
            </div>
          </section>
        ) : null}

        {/* Заголовок «Разделы сайта» блок выводит сам. */}
        <SectionTiles sections={sections} locale={locale} />

        <GalleryStrip albums={albums} locale={locale} />
        {showContacts ? <ContactCard profile={profile} locale={locale} /> : null}
      </div>
    </>
  );
}
