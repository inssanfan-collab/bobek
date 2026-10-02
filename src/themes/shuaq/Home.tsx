import { NewsCard, SiteLink, T as BLOCK_T, mediaUrl } from '@/components/site/blocks';
import { HeroButtons, HeroTitle } from '@/components/site/Hero';
import { RoutineCards, StatsRow } from '@/components/site/home-blocks';
import { ReviewList } from '@/components/site/sections';
import { CoverOr, EnrollLink, SectionHead, ThemeImage, aboutSection as findAbout, developmentAreas, findSection } from '@/components/site/theme-kit';
import { homeStats } from '@/lib/home-stats';
import { pick } from '@/lib/i18n';
import type { HomeProps } from '@/templates/types';
import { Sparkle, Sun } from './Doodles';

const THEME = 'shuaq';

const T = {
  welcome: { kk: 'Қош келдіңіз!', ru: 'Добро пожаловать!' },
  give: { kk: 'Бүлдіршіндерге біз не береміз?', ru: 'Что мы даём малышам?' },
  giveEyebrow: { kk: 'Даму бағыттары', ru: 'Направления развития' },
  about: { kk: 'Біз туралы', ru: 'О нас' },
  aboutTitle: { kk: 'Балаларға арналған сапалы тәрбие', ru: 'Качественное воспитание для детей' },
  more: { kk: 'Толығырақ', ru: 'Подробнее' },
  routine: { kk: 'Күн тәртібі', ru: 'Распорядок дня' },
  routineEyebrow: { kk: 'Балалардың күні', ru: 'День ребёнка' },
  gallery: { kk: 'Балалардың жарқын сәттері', ru: 'Яркие моменты детей' },
  allPhotos: { kk: 'Барлық фотолар', ru: 'Все фото' },
  reviews: { kk: 'Ата-аналар пікірлері', ru: 'Отзывы родителей' },
  cta: { kk: 'Балаңызды бізге әкеліңіз!', ru: 'Приводите малыша к нам!' },
  ctaLead: { kk: 'Балабақшамен танысып, тәрбиешілермен жүздесуге шақырамыз.', ru: 'Приглашаем познакомиться с садом и встретиться с воспитателями.' },
  langKk: { kk: 'Оқыту қазақ тілінде', ru: 'Обучение на казахском языке' },
  langRu: { kk: 'Оқыту орыс тілінде', ru: 'Обучение на русском языке' },
  langBoth: { kk: 'Қазақ және орыс топтары', ru: 'Казахские и русские группы' },
  hours: { kk: 'Жұмыс уақыты', ru: 'Часы работы' },
  free: { kk: 'Бос орындар бар', ru: 'Есть свободные места' },
} as const;

/** Картинка к карточке направления: своя для спорта, логики, творчества. */
const AREA_IMAGE: Record<string, string> = { health: 'sport', logic: 'logic', art: 'paint', speech: 'logic', social: 'paint' };
const CARD_IMAGES = ['sport', 'logic', 'paint'];

/**
 * Главная «Шуақ» — по структуре популярного «детского» сайта: первый экран
 * с карточкой-облачком и фото, «Что мы даём малышам» (кружки сада или
 * направления ГОСО), «О нас» с двумя фото, бирюзовая полоса распорядка,
 * галерея альбомов, новости, отзывы, коралловая полоса записи.
 */
export function ShuaqHome({ profile, news, albums, locale, coverUrl, coverPosition, hero, menu, clubs = [], routine = [], reviews = [], counts }: HomeProps) {
  const stats = homeStats(profile, counts, locale);
  const cards = clubs.length > 0
    ? clubs.slice(0, 3).map((club, index) => ({
        key: club.id,
        title: pick(locale, club.nameKk, club.nameRu),
        text: pick(locale, club.descKk, club.descRu),
        image: CARD_IMAGES[index % CARD_IMAGES.length],
      }))
    : developmentAreas(locale).filter((area) => ['health', 'logic', 'art'].includes(area.key)).map((area) => ({ ...area, image: AREA_IMAGE[area.key] }));
  const aboutText = pick(locale, profile?.aboutKk, profile?.aboutRu);
  const aboutSection = findAbout(menu);
  const gallerySection = findSection(menu, 'GALLERY');
  const checks = [
    profile?.langKk && profile?.langRu ? T.langBoth[locale] : profile?.langKk ? T.langKk[locale] : profile?.langRu ? T.langRu[locale] : null,
    profile?.workHours ? `${T.hours[locale]}: ${profile.workHours}` : null,
    profile?.placesFree ? T.free[locale] : null,
  ].filter((item): item is string => Boolean(item));

  return (
    <div className="shuaq-home">
      <section className="shuaq-hero">
        <div className="container-page grid items-center gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
          <div className="shuaq-bubble">
            <Sun className="shuaq-doodle shuaq-bubble-sun" />
            <p className="shuaq-badge">{hero.eyebrow || T.welcome[locale]}</p>
            <HeroTitle hero={hero} tone="plain" withEyebrow={false} className="shuaq-h1 font-display" />
            {hero.lead ? <p className="shuaq-lead">{hero.lead}</p> : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <HeroButtons hero={hero} tone="plain">
                <EnrollLink menu={menu} locale={locale} className="btn-primary" />
              </HeroButtons>
            </div>
            <StatsRow stats={stats} className="shuaq-stats" />
          </div>
          <div className="shuaq-hero-photo-wrap">
            <CoverOr coverUrl={coverUrl} coverPosition={coverPosition} theme={THEME} name="hero" className="shuaq-hero-photo" eager />
            <Sparkle className="shuaq-doodle shuaq-hero-sparkle" />
          </div>
        </div>
      </section>

      <section className="shuaq-section" aria-labelledby="shuaq-give">
        <div className="container-page">
          <SectionHead id="shuaq-give" eyebrow={T.giveEyebrow[locale]} title={T.give[locale]} className="kit-head text-center" />
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {cards.map((card) => (
              <li key={card.key} className="shuaq-card">
                <ThemeImage theme={THEME} name={card.image} className="shuaq-card-photo" sizes="(min-width: 768px) 33vw, 100vw" />
                <div className="p-6">
                  <h3 className="shuaq-card-title">{card.title}</h3>
                  {card.text ? <p className="shuaq-card-text">{card.text}</p> : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="shuaq-section shuaq-about" aria-labelledby="shuaq-about">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2">
          <div className="shuaq-collage">
            <CoverOr coverUrl={coverUrl} coverPosition={coverPosition} theme={THEME} name="logic" className="shuaq-collage-main" />
            <ThemeImage theme={THEME} name="paint" className="shuaq-collage-small" sizes="(min-width: 1024px) 25vw, 50vw" />
            {stats[0] ? (
              <p className="shuaq-collage-badge"><b>{stats[0].value}</b> {stats[0].label}</p>
            ) : null}
          </div>
          <div>
            <SectionHead id="shuaq-about" eyebrow={T.about[locale]} title={T.aboutTitle[locale]} />
            {aboutText && aboutText !== hero.lead ? <p className="shuaq-text mt-4">{aboutText}</p> : null}
            {checks.length > 0 ? (
              <ul className="mt-5 space-y-3">
                {checks.map((check) => (
                  <li key={check} className="shuaq-check">{check}</li>
                ))}
              </ul>
            ) : null}
            {aboutSection ? (
              <SiteLink href={`/${aboutSection.slug}`} locale={locale} className="btn-secondary mt-7 inline-flex">{T.more[locale]} →</SiteLink>
            ) : null}
          </div>
        </div>
      </section>

      {routine.length > 0 ? (
        <section className="shuaq-routine" aria-labelledby="shuaq-routine">
          <div className="container-page py-14">
            <SectionHead id="shuaq-routine" eyebrow={T.routineEyebrow[locale]} title={T.routine[locale]} className="kit-head text-center" />
            <RoutineCards items={routine} locale={locale} className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" />
          </div>
        </section>
      ) : null}

      {albums.length > 0 ? (
        <section className="shuaq-section" aria-labelledby="shuaq-gallery">
          <div className="container-page">
            <SectionHead id="shuaq-gallery" title={T.gallery[locale]} className="kit-head text-center" />
            <ul className="shuaq-gallery mt-10">
              {albums.slice(0, 5).map((album) => {
                const cover = mediaUrl(album.items[0]?.media);
                return (
                  <li key={album.id}>
                    <SiteLink href={`/${gallerySection?.slug ?? 'gallery'}/${album.slug}`} locale={locale} className="shuaq-gallery-item">
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element -- медиа отдаёт свой роут
                        <img src={cover} alt="" loading="lazy" />
                      ) : (
                        <ThemeImage theme={THEME} name="paint" />
                      )}
                      <span>{pick(locale, album.titleKk, album.titleRu)}</span>
                    </SiteLink>
                  </li>
                );
              })}
            </ul>
            {gallerySection ? (
              <p className="mt-8 text-center">
                <SiteLink href={`/${gallerySection.slug}`} locale={locale} className="btn-primary">{T.allPhotos[locale]}</SiteLink>
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      {news.length > 0 ? (
        <section className="shuaq-section" aria-labelledby="shuaq-news">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <SectionHead id="shuaq-news" title={BLOCK_T.news[locale]} />
              <SiteLink href="/news" locale={locale} className="shuaq-more">{BLOCK_T.allNews[locale]} →</SiteLink>
            </div>
            <div className="shuaq-news mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news.slice(0, 3).map((post) => <NewsCard key={post.id} post={post} locale={locale} />)}
            </div>
          </div>
        </section>
      ) : null}

      {reviews.length > 0 ? (
        <section className="shuaq-section" aria-labelledby="shuaq-reviews">
          <div className="container-page">
            <SectionHead id="shuaq-reviews" title={T.reviews[locale]} className="kit-head text-center" />
            <ReviewList reviews={reviews.slice(0, 3)} locale={locale} className="shuaq-reviews mt-10 grid gap-6 md:grid-cols-3" />
          </div>
        </section>
      ) : null}

      <section className="container-page pb-6">
        <div className="shuaq-band">
          <Sparkle className="shuaq-doodle shuaq-band-sparkle" />
          <h2 className="shuaq-band-title">{T.cta[locale]}</h2>
          <p className="shuaq-band-lead">{T.ctaLead[locale]}</p>
          <EnrollLink menu={menu} locale={locale} className="shuaq-band-button" />
        </div>
      </section>
    </div>
  );
}
