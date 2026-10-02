import { NewsCard, SiteLink, T as BLOCK_T } from '@/components/site/blocks';
import { HeroButtons, HeroTitle } from '@/components/site/Hero';
import { PriceList, ReviewList } from '@/components/site/sections';
import { CoverOr, EnrollLink, SectionHead, ThemeImage, aboutSection, developmentAreas, findSection } from '@/components/site/theme-kit';
import { pick } from '@/lib/i18n';
import type { HomeProps } from '@/templates/types';

const THEME = 'kunbagys';

const T = {
  more: { kk: 'Толығырақ', ru: 'Подробнее' },
  welcomeEyebrow: { kk: 'Біздің отбасына қош келдіңіз', ru: 'Добро пожаловать в нашу семью' },
  welcome: { kk: 'Балабақшамызға қош келдіңіз', ru: 'Добро пожаловать в наш сад' },
  why: { kk: 'Неге бізді таңдайды?', ru: 'Почему выбирают нас?' },
  programs: { kk: 'Біздің бағдарламалар', ru: 'Наши программы' },
  prices: { kk: 'Қызметтер құны', ru: 'Стоимость услуг' },
  allPrices: { kk: 'Барлық бағалар', ru: 'Все цены' },
  reviews: { kk: 'Пікірлер', ru: 'Отзывы' },
  hours: { kk: 'Жұмыс уақыты', ru: 'Часы работы' },
  langs: { kk: 'Қазақ және орыс тілдерінде', ru: 'На казахском и русском' },
  free: { kk: 'Бос орындар бар', ru: 'Есть свободные места' },
} as const;

/** Значки программ: глобус, мишка, счёты, лупа — по кругу. */
const ICONS = [
  'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-9 9h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z',
  'M7 7a2.5 2.5 0 1 1-2-4 2.5 2.5 0 0 1 2 4Zm10 0a2.5 2.5 0 1 0 2-4 2.5 2.5 0 0 0-2 4ZM12 21c4 0 7-2.7 7-7 0-4-3-7-7-7s-7 3-7 7c0 4.3 3 7 7 7Zm-2.5-8h.01M14.5 13h.01M10 17c1.2.8 2.8.8 4 0',
  'M4 4v16M20 4v16M4 8h16M4 16h16M8 6v4M11 6v4M13 14v4M16 14v4',
  'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Zm4.6-1.9L21 21',
];

/**
 * Главная «Күнбағыс» — оранжевая и строгая (структура дизайна №10):
 * фото на всю ширину с затемнением и текстом, приветствие с фото и списком
 * «Почему мы», четыре программы со значками, стоимость, отзывы, новости.
 */
export function KunbagysHome({ profile, news, locale, coverUrl, coverPosition, hero, menu, clubs = [], prices = [], reviews = [] }: HomeProps) {
  const about = aboutSection(menu);
  const pricesSection = findSection(menu, 'PRICES');
  const aboutText = pick(locale, profile?.aboutKk, profile?.aboutRu);
  const areas = developmentAreas(locale);
  const programs = clubs.length > 0
    ? clubs.slice(0, 4).map((club) => ({ key: club.id, title: pick(locale, club.nameKk, club.nameRu), text: pick(locale, club.descKk, club.descRu) }))
    : areas.slice(0, 4);
  const checks = [
    profile?.workHours ? `${T.hours[locale]}: ${profile.workHours}` : null,
    profile?.langKk && profile?.langRu ? T.langs[locale] : null,
    profile?.placesFree ? T.free[locale] : null,
  ].filter((check): check is string => Boolean(check));

  return (
    <div className="kunbagys-home">
      <section className="kunbagys-hero">
        <CoverOr coverUrl={coverUrl} coverPosition={coverPosition} theme={THEME} name="hero" className="kunbagys-hero-photo" eager />
        <div className="container-page relative py-20 lg:py-28">
          <div className="max-w-2xl">
            {hero.eyebrow ? <p className="kunbagys-pill">{hero.eyebrow}</p> : null}
            <HeroTitle hero={hero} tone="light" withEyebrow={false} className="kunbagys-h1 font-display" />
            {hero.lead ? <p className="kunbagys-lead">{hero.lead}</p> : null}
            <div className="mt-8 flex flex-wrap gap-3">
              <HeroButtons hero={hero} tone="light">
                <EnrollLink menu={menu} locale={locale} className="btn-primary" />
                {about ? <SiteLink href={`/${about.slug}`} locale={locale} className="kunbagys-ghost">{T.more[locale]}</SiteLink> : null}
              </HeroButtons>
            </div>
            {checks.length > 0 ? (
              <ul className="kunbagys-checks">
                {checks.map((check) => <li key={check}>{check}</li>)}
              </ul>
            ) : null}
          </div>
        </div>
      </section>

      <section className="kunbagys-section" aria-labelledby="kunbagys-welcome">
        <div className="container-page">
          <SectionHead id="kunbagys-welcome" eyebrow={T.welcomeEyebrow[locale]} title={T.welcome[locale]} lead={aboutText && aboutText !== hero.lead ? aboutText : null} className="kit-head text-center" />
          <div className="mt-12 grid items-center gap-10 lg:grid-cols-2">
            <ThemeImage theme={THEME} name="blocks" className="kunbagys-photo" />
            <div>
              <h3 className="kunbagys-subtitle">{T.why[locale]}</h3>
              <ul className="mt-5 space-y-4">
                {areas.slice(0, 4).map((area) => (
                  <li key={area.key} className="kunbagys-why">
                    <b>{area.title}</b>
                    <span>{area.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="kunbagys-section kunbagys-grey" aria-labelledby="kunbagys-programs">
        <div className="container-page">
          <SectionHead id="kunbagys-programs" title={T.programs[locale]} className="kit-head text-center" />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {programs.map((program, index) => (
              <li key={program.key} className="kunbagys-program">
                <span className="kunbagys-icon" aria-hidden>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d={ICONS[index % ICONS.length]} />
                  </svg>
                </span>
                <h3>{program.title}</h3>
                {program.text ? <p>{program.text}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {prices.length > 0 ? (
        <section className="kunbagys-section" aria-labelledby="kunbagys-prices">
          <div className="container-page">
            <SectionHead id="kunbagys-prices" title={T.prices[locale]} className="kit-head text-center" />
            <PriceList plans={prices.slice(0, 3)} locale={locale} className="kunbagys-prices mt-10 grid gap-6 md:grid-cols-3" />
            {pricesSection && prices.length > 3 ? (
              <p className="mt-8 text-center"><SiteLink href={`/${pricesSection.slug}`} locale={locale} className="btn-secondary">{T.allPrices[locale]}</SiteLink></p>
            ) : null}
          </div>
        </section>
      ) : null}

      {reviews.length > 0 ? (
        <section className="kunbagys-section kunbagys-grey" aria-labelledby="kunbagys-reviews">
          <div className="container-page">
            <SectionHead id="kunbagys-reviews" title={T.reviews[locale]} className="kit-head text-center" />
            <ReviewList reviews={reviews.slice(0, 3)} locale={locale} className="kunbagys-reviews mt-10 grid gap-6 md:grid-cols-3" />
          </div>
        </section>
      ) : null}

      {news.length > 0 ? (
        <section className="kunbagys-section" aria-labelledby="kunbagys-news">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <SectionHead id="kunbagys-news" title={BLOCK_T.news[locale]} />
              <SiteLink href="/news" locale={locale} className="kunbagys-more">{BLOCK_T.allNews[locale]} →</SiteLink>
            </div>
            <div className="kunbagys-news mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news.slice(0, 3).map((post) => <NewsCard key={post.id} post={post} locale={locale} />)}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
