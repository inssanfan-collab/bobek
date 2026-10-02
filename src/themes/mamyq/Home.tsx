import { ContactCard, NewsCard, SiteLink, T as BLOCK_T } from '@/components/site/blocks';
import { HeroButtons, HeroTitle } from '@/components/site/Hero';
import { StatsRow } from '@/components/site/home-blocks';
import { RouteMap } from '@/components/site/RouteMap';
import { PriceList, ReviewList } from '@/components/site/sections';
import { CoverOr, EnrollLink, SectionHead, ThemeImage, aboutSection, developmentAreas, findSection } from '@/components/site/theme-kit';
import { homeStats } from '@/lib/home-stats';
import { pick } from '@/lib/i18n';
import type { HomeProps } from '@/templates/types';

const THEME = 'mamyq';

const T = {
  more: { kk: 'Толығырақ', ru: 'Подробнее' },
  missionEyebrow: { kk: 'Біздің миссиямыз', ru: 'Наша миссия' },
  mission: { kk: 'Баланың табиғи қызығушылығын сүйіспеншілікпен дамыту', ru: 'Развивать природное любопытство ребёнка с любовью' },
  prices: { kk: 'Біздің абонементтер', ru: 'Наши абонементы' },
  allPrices: { kk: 'Толық бағалар', ru: 'Все цены' },
  reviews: { kk: 'Ата-аналар пікірлері', ru: 'Отзывы родителей' },
  contacts: { kk: 'Бізді табу оңай', ru: 'Нас легко найти' },
  langKk: { kk: 'Қазақ тілінде', ru: 'На казахском' },
  langRu: { kk: 'Орыс тілінде', ru: 'На русском' },
} as const;

/**
 * Главная «Мамық» — пудровая и мягкая (структура дизайна №9): слоган
 * с фото в фигурной рамке, миссия с круглым фото и направлениями,
 * абонементы (цены частного сада), крупные счётчики, новости, отзывы,
 * карта с контактами.
 */
export function MamyqHome({ profile, news, locale, coverUrl, coverPosition, hero, menu, prices = [], reviews = [], counts }: HomeProps) {
  const stats = homeStats(profile, counts, locale);
  const about = aboutSection(menu);
  const pricesSection = findSection(menu, 'PRICES');
  const aboutText = pick(locale, profile?.aboutKk, profile?.aboutRu);
  const facts = [
    profile?.langKk ? T.langKk[locale] : null,
    profile?.langRu ? T.langRu[locale] : null,
    profile?.workHours ?? null,
  ].filter((fact): fact is string => Boolean(fact));

  return (
    <div className="mamyq-home">
      <section className="mamyq-hero">
        <div className="container-page grid items-center gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
          <div>
            {hero.eyebrow ? <p className="mamyq-pill">{hero.eyebrow}</p> : null}
            <HeroTitle hero={hero} tone="plain" withEyebrow={false} className="mamyq-h1 font-display" />
            {hero.lead ? <p className="mamyq-lead">{hero.lead}</p> : null}
            <div className="mt-7 flex flex-wrap gap-3">
              <HeroButtons hero={hero} tone="plain">
                <EnrollLink menu={menu} locale={locale} className="btn-primary" />
                {about ? <SiteLink href={`/${about.slug}`} locale={locale} className="btn-secondary">{T.more[locale]}</SiteLink> : null}
              </HeroButtons>
            </div>
            {facts.length > 0 ? (
              <ul className="mamyq-facts">
                {facts.map((fact) => <li key={fact}>{fact}</li>)}
              </ul>
            ) : null}
          </div>
          <div className="mamyq-frame">
            <CoverOr coverUrl={coverUrl} coverPosition={coverPosition} theme={THEME} name="hero" className="mamyq-photo" eager />
          </div>
        </div>
      </section>

      <section className="mamyq-section" aria-labelledby="mamyq-mission">
        <div className="container-page grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <ThemeImage theme={THEME} name="walk" className="mamyq-circle" sizes="(min-width: 1024px) 30vw, 80vw" />
          <div>
            <SectionHead id="mamyq-mission" eyebrow={T.missionEyebrow[locale]} title={T.mission[locale]} lead={aboutText && aboutText !== hero.lead ? aboutText : null} />
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {developmentAreas(locale, 4).map((area) => (
                <li key={area.key} className="mamyq-card">
                  <b>{area.title}</b>
                  <span>{area.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {prices.length > 0 ? (
        <section className="mamyq-section mamyq-blush" aria-labelledby="mamyq-prices">
          <div className="container-page">
            <SectionHead id="mamyq-prices" title={T.prices[locale]} className="kit-head text-center" />
            <PriceList plans={prices.slice(0, 3)} locale={locale} className="mamyq-prices mt-10 grid gap-6 md:grid-cols-3" />
            {pricesSection && prices.length > 3 ? (
              <p className="mt-8 text-center"><SiteLink href={`/${pricesSection.slug}`} locale={locale} className="btn-secondary">{T.allPrices[locale]}</SiteLink></p>
            ) : null}
          </div>
        </section>
      ) : null}

      {stats.length > 0 ? (
        <section className="container-page py-10">
          <StatsRow stats={stats} className="mamyq-stats" />
        </section>
      ) : null}

      {news.length > 0 ? (
        <section className="mamyq-section" aria-labelledby="mamyq-news">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <SectionHead id="mamyq-news" title={BLOCK_T.news[locale]} />
              <SiteLink href="/news" locale={locale} className="mamyq-more">{BLOCK_T.allNews[locale]} →</SiteLink>
            </div>
            <div className="mamyq-news mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news.slice(0, 3).map((post) => <NewsCard key={post.id} post={post} locale={locale} />)}
            </div>
          </div>
        </section>
      ) : null}

      {reviews.length > 0 ? (
        <section className="mamyq-section mamyq-blush" aria-labelledby="mamyq-reviews">
          <div className="container-page">
            <SectionHead id="mamyq-reviews" title={T.reviews[locale]} className="kit-head text-center" />
            <ReviewList reviews={reviews.slice(0, 3)} locale={locale} className="mamyq-reviews mt-10 grid gap-6 md:grid-cols-3" />
          </div>
        </section>
      ) : null}

      {profile ? (
        <section className="mamyq-section" aria-labelledby="mamyq-contacts">
          <div className="container-page">
            <SectionHead id="mamyq-contacts" title={T.contacts[locale]} className="kit-head text-center" />
            <div className="mamyq-map-wrap mt-10">
              <div className="mamyq-map">
                <RouteMap lat={profile.lat} lng={profile.lng} address={pick(locale, profile.addressKk, profile.addressRu)} locale={locale} />
              </div>
              <div className="mamyq-contact"><ContactCard profile={profile} locale={locale} /></div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
