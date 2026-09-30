import {
  ContactCard, GalleryStrip, NewsCard, PlacesBadge, SectionTiles, SiteLink, T,
} from '@/components/site/blocks';
import { HeroButtons, HeroTitle } from '@/components/site/Hero';
import { pick } from '@/lib/i18n';
import type { HomeProps } from '@/templates/types';
import { Cloud, Feather, Ripple, Sparkle, Swan } from './Doodles';

/**
 * Главная «Аққу» — лебединое озеро на рассвете (дизайн-система из Stitch).
 * Первый экран — небо от голубого к сиреневому с облаками, обложка
 * в толстой белой рамке, у её нижнего края по волнам плывёт лебедь,
 * справа — плашка с названием сада. Разделы
 * секций — рябь на воде, по краям летают пёрышки.
 */
export function AkkuHome({ profile, sections, news, announcements, albums, locale, coverUrl, coverPosition, showContacts, hero }: HomeProps) {
  // Плашка у фото — короткое название сада, как подпись к снимку.
  const badge = pick(locale, profile?.shortNameKk || profile?.nameKk, profile?.shortNameRu || profile?.nameRu);

  return (
    <div className="akku-home">
      <section className="akku-hero">
        <Cloud className="akku-doodle akku-cloud-1" />
        <Cloud className="akku-doodle akku-cloud-2" />
        <Feather className="akku-doodle akku-feather-1" />
        <Sparkle className="akku-doodle akku-sparkle-1" />
        <Sparkle className="akku-doodle akku-sparkle-2" />
        <div className="container-page relative grid items-center gap-10 pb-16 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-24 lg:pt-16">
          <div>
            <HeroTitle hero={hero} tone="plain" className="akku-h1 font-display" />
            {hero.lead ? <p className="akku-lead mt-5 max-w-xl text-lg leading-relaxed">{hero.lead}</p> : null}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <HeroButtons hero={hero} tone="plain">
                {profile?.phone ? (
                  <a href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`} className="btn-primary">{profile.phone}</a>
                ) : null}
              </HeroButtons>
              <PlacesBadge profile={profile} locale={locale} />
            </div>
          </div>

          <div className="akku-pond-wrap">
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl} alt="" style={{ objectPosition: coverPosition }} className="akku-pond" />
            ) : (
              <div className="akku-pond akku-pond-empty" aria-hidden />
            )}
            <Swan className="akku-doodle akku-pond-swan" />
            {badge ? (
              <p className="akku-pond-badge">
                <Swan round className="h-10 w-10 shrink-0" />
                <span>{badge}</span>
              </p>
            ) : null}
          </div>
        </div>
        <Ripple className="akku-ripple" />
      </section>

      <div className="container-page relative space-y-16 pb-16 pt-6">
        <Feather className="akku-doodle akku-feather-2" />

        {announcements.length > 0 ? (
          <section className="akku-notice">
            <p className="akku-notice-label">{T.announcements[locale]}</p>
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

        <div className="akku-tiles">
          <SectionTiles sections={sections} locale={locale} />
        </div>

        {news.length > 0 ? (
          <section>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="akku-heading font-display">{T.news[locale]}</h2>
              <SiteLink href="/news" locale={locale} className="akku-more">{T.allNews[locale]} →</SiteLink>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news.slice(0, 3).map((post) => (
                <NewsCard key={post.id} post={post} locale={locale} />
              ))}
            </div>
          </section>
        ) : null}

        <div className="akku-gallery">
          <GalleryStrip albums={albums.slice(0, 3)} locale={locale} />
        </div>

        {showContacts ? (
          <div className="akku-contacts">
            <ContactCard profile={profile} locale={locale} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
