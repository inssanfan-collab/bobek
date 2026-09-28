import {
  ContactCard, GalleryStrip, NewsCard, PlacesBadge, SectionTiles, SiteLink, T,
} from '@/components/site/blocks';
import { HeroButtons, HeroTitle } from '@/components/site/Hero';
import { pick } from '@/lib/i18n';
import type { HomeProps } from '@/templates/types';
import { DalaCorner, DalaDivider } from './Ornament';

/**
 * Главная «Далы». Объявления — полосой над первым экраном; первый экран —
 * текст слева и обложка в арке справа (как дверной проём юрты); дальше
 * разделы, новости, альбомы и контакты, между ними — тонкий орнамент.
 * Данные и блоки общие со стандартными шаблонами, своя — раскладка.
 */
export function DalaHome({ profile, sections, news, announcements, albums, locale, coverUrl, coverPosition, showContacts, hero }: HomeProps) {
  return (
    <div className="dala-home">
      {announcements.length > 0 ? (
        <div className="dala-notice">
          <div className="container-page flex items-start gap-3 py-2.5 text-sm">
            <MegaphoneIcon />
            <p className="min-w-0">
              <span className="font-bold">{T.announcements[locale]}: </span>
              {announcements.slice(0, 2).map((item, index) => (
                <span key={item.id}>
                  {index > 0 ? <span aria-hidden> · </span> : null}
                  <SiteLink href={`/announcements/${item.slug}`} locale={locale} className="underline-offset-2 hover:underline">
                    {pick(locale, item.titleKk, item.titleRu)}
                  </SiteLink>
                </span>
              ))}
            </p>
          </div>
        </div>
      ) : null}

      <section className="dala-hero">
        <div className="container-page grid items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-16">
          <div>
            <HeroTitle hero={hero} tone="plain" className="dala-h1 font-display font-extrabold" />
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

          <div className="dala-arch-wrap">
            <DalaCorner className="dala-corner" />
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl} alt="" style={{ objectPosition: coverPosition }} className="dala-arch" />
            ) : (
              <div className="dala-arch dala-arch-empty" aria-hidden />
            )}
          </div>
        </div>
      </section>

      <DalaDivider />

      <div className="container-page space-y-16 pb-16 pt-6">
        <div className="dala-tiles">
          <SectionTiles sections={sections} locale={locale} />
        </div>

        {news.length > 0 ? (
          <section>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="dala-heading font-display text-3xl font-extrabold">{T.news[locale]}</h2>
              <SiteLink href="/news" locale={locale} className="dala-more">{T.allNews[locale]} →</SiteLink>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {news.slice(0, 3).map((post) => (
                <NewsCard key={post.id} post={post} locale={locale} />
              ))}
            </div>
          </section>
        ) : null}

        <div className="dala-gallery">
          <GalleryStrip albums={albums.slice(0, 3)} locale={locale} />
        </div>

        {showContacts ? (
          <div className="dala-contacts">
            <ContactCard profile={profile} locale={locale} />
            <DalaCorner className="dala-contacts-corner" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MegaphoneIcon() {
  return (
    <svg className="mt-0.5 h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 10v4a1 1 0 0 0 1 1h3l6 4V5L7 9H4a1 1 0 0 0-1 1Z" />
      <path d="M17 9a4 4 0 0 1 0 6" />
    </svg>
  );
}
