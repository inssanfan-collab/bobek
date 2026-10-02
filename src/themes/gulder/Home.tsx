import { NewsCard, SiteLink, T as BLOCK_T } from '@/components/site/blocks';
import { HeroButtons, HeroTitle } from '@/components/site/Hero';
import { StatsRow } from '@/components/site/home-blocks';
import { ReviewList } from '@/components/site/sections';
import { CoverOr, EnrollLink, SectionHead, ThemeImage, aboutSection, developmentAreas } from '@/components/site/theme-kit';
import { homeStats } from '@/lib/home-stats';
import { pick } from '@/lib/i18n';
import type { HomeProps } from '@/templates/types';

const THEME = 'gulder';

const T = {
  more: { kk: 'Толығырақ', ru: 'Подробнее' },
  about: { kk: 'Біз туралы', ru: 'О нас' },
  aboutTitle: { kk: 'Балалық шақтың бақытты әрі жарқын сәттері', ru: 'Счастливые и яркие моменты детства' },
  pages: { kk: 'Сайт бөлімдері', ru: 'Разделы сайта' },
  clubs: { kk: 'Біздің үйірмелер', ru: 'Наши кружки' },
  directions: { kk: 'Даму бағыттары', ru: 'Направления развития' },
  reviews: { kk: 'Ата-аналар пікірлері', ru: 'Отзывы родителей' },
  enroll: { kk: 'Балабақшаға жазылу', ru: 'Запись в детский сад' },
  enrollLead: { kk: 'Өтінім қалдырыңыз — біз хабарласып, барлық сұрақтарға жауап береміз.', ru: 'Оставьте заявку — мы перезвоним и ответим на все вопросы.' },
} as const;

/** Разделы, которые встают таблетками в «О нас» — что есть у сада. */
const PILL_TYPES = ['PAGE', 'GROUPS', 'STAFF', 'DOCUMENTS', 'MENU_FOOD', 'CLUBS', 'GALLERY'] as const;

/**
 * Главная «Гүлдер» — розово-фиолетовая (структура дизайна №8): слоган
 * с двумя фото и счётчиками-значками, «О нас» с фото и разделами-таблетками,
 * три градиентные карточки кружков, новости, отзывы, запись с фото.
 */
export function GulderHome({ profile, news, locale, coverUrl, coverPosition, hero, menu = [], clubs = [], reviews = [], counts }: HomeProps) {
  const stats = homeStats(profile, counts, locale);
  const about = aboutSection(menu);
  const aboutText = pick(locale, profile?.aboutKk, profile?.aboutRu);
  const pills = menu.filter((section) => (PILL_TYPES as readonly string[]).includes(section.type)).slice(0, 6);
  const cards = clubs.length > 0
    ? clubs.slice(0, 3).map((club) => ({ key: club.id, title: pick(locale, club.nameKk, club.nameRu), text: pick(locale, club.descKk, club.descRu) }))
    : developmentAreas(locale).filter((area) => ['art', 'speech', 'health'].includes(area.key));

  return (
    <div className="gulder-home">
      <section className="gulder-hero">
        <div className="container-page grid items-center gap-10 py-12 lg:grid-cols-2 lg:py-16">
          <div>
            {hero.eyebrow ? <p className="gulder-pill">{hero.eyebrow}</p> : null}
            <HeroTitle hero={hero} tone="plain" withEyebrow={false} className="gulder-h1 font-display" />
            {hero.lead ? <p className="gulder-lead">{hero.lead}</p> : null}
            <div className="mt-7 flex flex-wrap gap-3">
              <HeroButtons hero={hero} tone="plain">
                <EnrollLink menu={menu} locale={locale} className="btn-primary" />
                {about ? <SiteLink href={`/${about.slug}`} locale={locale} className="btn-secondary">{T.more[locale]}</SiteLink> : null}
              </HeroButtons>
            </div>
          </div>
          <div className="gulder-photos">
            <CoverOr coverUrl={coverUrl} coverPosition={coverPosition} theme={THEME} name="hero" className="gulder-photo-main" eager />
            <ThemeImage theme={THEME} name="walk" className="gulder-photo-side" sizes="(min-width: 1024px) 20vw, 45vw" />
            <StatsRow stats={stats} className="gulder-badges" />
          </div>
        </div>
      </section>

      <section className="gulder-section gulder-lavender" aria-labelledby="gulder-about">
        <div className="container-page">
          <SectionHead id="gulder-about" eyebrow={T.about[locale]} title={T.aboutTitle[locale]} lead={aboutText && aboutText !== hero.lead ? aboutText : null} className="kit-head text-center" />
          <div className="mt-12 grid items-center gap-10 lg:grid-cols-2">
            <ThemeImage theme={THEME} name="paint" className="gulder-about-photo" />
            {pills.length > 0 ? (
              <div>
                <h3 className="gulder-subtitle">{T.pages[locale]}</h3>
                <ul className="mt-5 space-y-3">
                  {pills.map((section, index) => (
                    <li key={section.id}>
                      <SiteLink href={`/${section.slug}`} locale={locale} className={`gulder-link gulder-link-${index % 2}`}>
                        {pick(locale, section.titleKk, section.titleRu)} <span aria-hidden>→</span>
                      </SiteLink>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="gulder-section" aria-labelledby="gulder-clubs">
        <div className="container-page">
          <SectionHead id="gulder-clubs" title={clubs.length > 0 ? T.clubs[locale] : T.directions[locale]} className="kit-head text-center" />
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {cards.map((card) => (
              <li key={card.key} className="gulder-card">
                <h3>{card.title}</h3>
                {card.text ? <p>{card.text}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {news.length > 0 ? (
        <section className="gulder-section gulder-lavender" aria-labelledby="gulder-news">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <SectionHead id="gulder-news" title={BLOCK_T.news[locale]} />
              <SiteLink href="/news" locale={locale} className="gulder-more">{BLOCK_T.allNews[locale]} →</SiteLink>
            </div>
            <div className="gulder-news mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news.slice(0, 3).map((post) => <NewsCard key={post.id} post={post} locale={locale} />)}
            </div>
          </div>
        </section>
      ) : null}

      {reviews.length > 0 ? (
        <section className="gulder-section" aria-labelledby="gulder-reviews">
          <div className="container-page">
            <SectionHead id="gulder-reviews" title={T.reviews[locale]} className="kit-head text-center" />
            <ReviewList reviews={reviews.slice(0, 3)} locale={locale} className="gulder-reviews mt-10 grid gap-6 md:grid-cols-3" />
          </div>
        </section>
      ) : null}

      <section className="gulder-section gulder-lavender" aria-labelledby="gulder-enroll">
        <div className="container-page grid items-center gap-8 lg:grid-cols-2">
          <ThemeImage theme={THEME} name="read" className="gulder-about-photo" />
          <div className="gulder-enroll">
            <h2 id="gulder-enroll">{T.enroll[locale]}</h2>
            <p>{T.enrollLead[locale]}</p>
            <EnrollLink menu={menu} locale={locale} className="btn-primary mt-6 inline-flex" />
          </div>
        </div>
      </section>
    </div>
  );
}
