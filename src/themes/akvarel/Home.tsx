import {
  ContactCard, GalleryStrip, NewsCard, PlacesBadge, SectionTiles, SiteLink, T,
} from '@/components/site/blocks';
import { HeroButtons, HeroTitle } from '@/components/site/Hero';
import { pick } from '@/lib/i18n';
import type { HomeProps } from '@/templates/types';
import { Boat, Cloud, Star, Sun, Wave } from './Doodles';

/**
 * Главная «Акварели»: первый экран на акварельных пятнах, обложка —
 * в мягкой «капле», по краям — облачко, солнце, звезда и кораблик.
 * Секции разделены волной, плитки разделов — с пунктирной пастельной
 * рамкой разных цветов.
 */
export function AkvarelHome({ profile, sections, news, announcements, albums, locale, coverUrl, coverPosition, showContacts, hero }: HomeProps) {
  return (
    <div className="akvarel-home">
      <section className="akvarel-hero">
        <Cloud className="akvarel-doodle akvarel-cloud" />
        <Sun className="akvarel-doodle akvarel-sun" />
        <Star className="akvarel-doodle akvarel-star" />
        <div className="container-page relative grid items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-16">
          <div>
            <HeroTitle hero={hero} tone="plain" className="akvarel-h1 font-display" />
            {hero.lead ? <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">{hero.lead}</p> : null}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <HeroButtons hero={hero} tone="plain">
                {profile?.phone ? (
                  <a href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`} className="btn-primary">{profile.phone}</a>
                ) : null}
              </HeroButtons>
              <PlacesBadge profile={profile} locale={locale} />
            </div>
          </div>

          <div className="akvarel-blob-wrap">
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl} alt="" style={{ objectPosition: coverPosition }} className="akvarel-blob" />
            ) : (
              <div className="akvarel-blob akvarel-blob-empty" aria-hidden />
            )}
            <Boat className="akvarel-doodle akvarel-boat" />
          </div>
        </div>
        <Wave className="akvarel-wave" />
      </section>

      <div className="container-page space-y-16 pb-16 pt-4">
        {announcements.length > 0 ? (
          <section className="akvarel-notice">
            <p className="akvarel-notice-label">{T.announcements[locale]}</p>
            <ul className="mt-2 space-y-1.5">
              {announcements.slice(0, 3).map((item) => (
                <li key={item.id}>
                  <SiteLink href={`/announcements/${item.slug}`} locale={locale} className="font-bold underline-offset-4 hover:underline">
                    {pick(locale, item.titleKk, item.titleRu)}
                  </SiteLink>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="akvarel-tiles">
          <SectionTiles sections={sections} locale={locale} />
        </div>

        {news.length > 0 ? (
          <section>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="akvarel-heading font-display">{T.news[locale]}</h2>
              <SiteLink href="/news" locale={locale} className="akvarel-more">{T.allNews[locale]} →</SiteLink>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news.slice(0, 3).map((post) => (
                <NewsCard key={post.id} post={post} locale={locale} />
              ))}
            </div>
          </section>
        ) : null}

        <div className="akvarel-gallery">
          <GalleryStrip albums={albums.slice(0, 3)} locale={locale} />
        </div>

        {showContacts ? (
          <div className="akvarel-contacts">
            <ContactCard profile={profile} locale={locale} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
