import {
  ContactCard, GalleryStrip, NewsCard, PlacesBadge, SectionTiles, SiteLink, T,
} from '@/components/site/blocks';
import { HeroButtons, HeroTitle } from '@/components/site/Hero';
import { pick } from '@/lib/i18n';
import type { HomeProps } from '@/templates/types';

/**
 * Главная «Конструктора»: красная полоса объявлений, крупный заголовок,
 * где выделенная часть лежит на жёлтом кубике, обложка в толстой рамке
 * со смещённой тенью; за ней — синяя арка и жёлтый круг. Разделы —
 * разноцветными блоками, новости и альбомы — в рамках с тенью.
 */
export function KonstruktorHome({ profile, sections, news, announcements, albums, locale, coverUrl, coverPosition, showContacts, hero }: HomeProps) {
  return (
    <div className="kon-home">
      {announcements.length > 0 ? (
        <div className="kon-notice">
          <div className="container-page flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-sm">
            <span className="kon-notice-label">{T.announcements[locale]}</span>
            {announcements.slice(0, 2).map((item) => (
              <SiteLink key={item.id} href={`/announcements/${item.slug}`} locale={locale} className="font-semibold underline-offset-4 hover:underline">
                {pick(locale, item.titleKk, item.titleRu)}
              </SiteLink>
            ))}
          </div>
        </div>
      ) : null}

      <section className="kon-hero">
        <span className="kon-dot kon-dot-a decor" aria-hidden />
        <span className="kon-dot kon-dot-b decor" aria-hidden />
        <div className="container-page relative grid items-center gap-12 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
          <div>
            <HeroTitle hero={hero} tone="plain" className="kon-h1 font-display" />
            {hero.lead ? <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/80">{hero.lead}</p> : null}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <HeroButtons hero={hero} tone="plain">
                {profile?.phone ? (
                  <a href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`} className="btn-primary">{profile.phone}</a>
                ) : null}
              </HeroButtons>
              <PlacesBadge profile={profile} locale={locale} />
            </div>
          </div>

          <div className="kon-frame-wrap">
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl} alt="" style={{ objectPosition: coverPosition }} className="kon-frame" />
            ) : (
              <div className="kon-frame kon-frame-empty" aria-hidden />
            )}
          </div>
        </div>
      </section>

      <div className="container-page space-y-16 pb-16 pt-12">
        <div className="kon-tiles">
          <SectionTiles sections={sections} locale={locale} />
        </div>

        {news.length > 0 ? (
          <section>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="kon-heading font-display">{T.news[locale]}</h2>
              <SiteLink href="/news" locale={locale} className="kon-more">{T.allNews[locale]} →</SiteLink>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news.slice(0, 3).map((post) => (
                <NewsCard key={post.id} post={post} locale={locale} />
              ))}
            </div>
          </section>
        ) : null}

        <div className="kon-gallery">
          <GalleryStrip albums={albums.slice(0, 3)} locale={locale} />
        </div>

        {showContacts ? (
          <div className="kon-contacts">
            <ContactCard profile={profile} locale={locale} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
