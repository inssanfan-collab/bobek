import { NewsCard, SiteLink, T as BLOCK_T } from '@/components/site/blocks';
import { HeroButtons, HeroTitle } from '@/components/site/Hero';
import { Stars } from '@/components/site/sections';
import { CoverOr, EnrollLink, ThemeImage, aboutSection, albumPhotos, developmentAreas, findSection } from '@/components/site/theme-kit';
import { homeStats } from '@/lib/home-stats';
import { pick, type Locale } from '@/lib/i18n';
import type { HomeProps } from '@/templates/types';
import { Cloud, HangingClouds, Icon, Plane, routineIcon } from './Doodles';

const THEME = 'shuaq';

type Pair = { kk: [string, string]; ru: [string, string] };

const H: Record<string, Pair> = {
  give: { kk: ['Бүлдіршіндерге біз', 'не береміз?'], ru: ['Что мы даём', 'малышам?'] },
  about: { kk: ['Балаларға арналған', 'сапалы тәрбие'], ru: ['Заботливое воспитание', 'для каждого ребёнка'] },
  routine: { kk: ['Күн', 'тәртібі'], ru: ['Распорядок', 'дня'] },
  gallery: { kk: ['Балалардың', 'жарқын сәттері'], ru: ['Яркие', 'моменты детей'] },
  reviews: { kk: ['Ата-аналардың', 'пікірлері'], ru: ['Отзывы', 'родителей'] },
  news: { kk: ['Соңғы', 'жаңалықтар'], ru: ['Последние', 'новости'] },
};

const T = {
  welcome: { kk: 'Кел, балалар, ойнайық!', ru: 'Давайте играть вместе!' },
  aboutPill: { kk: 'Біз туралы', ru: 'О нас' },
  more: { kk: 'Толығырақ', ru: 'Подробнее' },
  allPhotos: { kk: 'Барлық фото', ru: 'Все фото' },
} as const;

/** Заголовок в два цвета: первая часть тёмная, вторая — зелёная, как в образце. */
function TwoTone({ pair, locale, id, light = false }: { pair: Pair; locale: Locale; id?: string; light?: boolean }) {
  const [first, accent] = pair[locale];
  return (
    <h2 id={id} className={`shuaq-title ${light ? 'shuaq-title-light' : ''}`}>
      {first} <span className="shuaq-green">{accent}</span>
    </h2>
  );
}

const CARD_IMAGES = ['play', 'sport', 'abacus'];
const CARD_ICONS = ['slide', 'school', 'easel'];

/**
 * Главная «Шуақ» — по образцу дизайна №1: фото ребёнка на всю ширину
 * с белым облачком-карточкой и рисунком, кремовый фон в узорах с тремя
 * фото-карточками, «О нас» с бежевым кругом и плашкой, фиолетовая
 * полоса распорядка с облаками и самолётиком, галерея плиткой из альбомов
 * сада, новости, отзыв на розово-оранжевом градиенте рядом с фото.
 * Фото и рисунки — сгенерированные; тексты и данные — сада.
 */
export function ShuaqHome({ profile, news, albums, locale, coverUrl, coverPosition, hero, menu, clubs = [], routine = [], reviews = [], counts }: HomeProps) {
  const stats = homeStats(profile, counts, locale);
  const about = aboutSection(menu);
  const clubsSection = findSection(menu, 'CLUBS');
  const gallerySection = findSection(menu, 'GALLERY');
  const aboutText = pick(locale, profile?.aboutKk, profile?.aboutRu) || hero.lead;
  const photos = albumPhotos(albums, locale, 5);
  const cards = clubs.length > 0
    ? clubs.slice(0, 3).map((club) => ({ key: club.id, title: pick(locale, club.nameKk, club.nameRu) }))
    : developmentAreas(locale).filter((area) => ['health', 'logic', 'art'].includes(area.key)).map((area) => ({ key: area.key, title: area.title }));
  const cardHref = clubsSection ? `/${clubsSection.slug}` : about ? `/${about.slug}` : null;

  return (
    <div className="shuaq-home">
      <section className="shuaq-hero">
        <ThemeImage theme={THEME} name="hero" className="shuaq-hero-photo" sizes="100vw" eager />
        <div className="container-page shuaq-hero-inner">
          <div className="shuaq-bubble">
            <div className="shuaq-bubble-text">
              <p className="shuaq-eyebrow"><span aria-hidden>♥</span>{hero.eyebrow || T.welcome[locale]}</p>
              <HeroTitle hero={hero} tone="plain" withEyebrow={false} className="shuaq-h1" />
              {hero.lead ? <p className="shuaq-lead">{hero.lead}</p> : null}
              <div className="mt-5 flex flex-wrap gap-3">
                <HeroButtons hero={hero} tone="plain">
                  <EnrollLink menu={menu} locale={locale} className="shuaq-btn" />
                </HeroButtons>
              </div>
            </div>
            <ThemeImage theme={THEME} name="cartoon" className="shuaq-cartoon decor" sizes="(min-width: 1024px) 18vw, 50vw" />
          </div>
        </div>
      </section>

      <section className="shuaq-pattern" aria-labelledby="shuaq-give">
        <div className="container-page py-16 text-center">
          <TwoTone pair={H.give} locale={locale} id="shuaq-give" />
          <ul className="mt-10 grid gap-7 text-left md:grid-cols-3">
            {cards.map((card, index) => {
              const inner = (
                <>
                  <ThemeImage theme={THEME} name={CARD_IMAGES[index % 3]} className="shuaq-card-photo" sizes="(min-width: 768px) 33vw, 100vw" />
                  <span className="shuaq-card-label">
                    <Icon name={CARD_ICONS[index % 3]} className="h-7 w-7 shrink-0" />
                    <span className="flex-1">{card.title}</span>
                    <span className="shuaq-card-arrow"><Icon name="arrow" className="h-4 w-4" /></span>
                  </span>
                </>
              );
              return (
                <li key={card.key} className="shuaq-card">
                  {cardHref ? <SiteLink href={cardHref} locale={locale} className="block">{inner}</SiteLink> : inner}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="shuaq-about" aria-labelledby="shuaq-about">
        <div className="container-page grid items-center gap-12 py-20 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="shuaq-about-art">
            <span className="shuaq-about-circle" aria-hidden />
            <ThemeImage theme={THEME} name="girl" className="shuaq-about-small" sizes="(min-width: 1024px) 12vw, 30vw" />
            <CoverOr coverUrl={coverUrl} coverPosition={coverPosition} theme={THEME} name="faces" className="shuaq-about-main" />
            {stats[0] ? (
              <p className="shuaq-about-badge">
                <b>{stats[0].value}</b>
                <span>{stats[0].label}</span>
              </p>
            ) : null}
            <Plane className="shuaq-about-plane" color="#D61C6B" />
          </div>
          <div>
            <TwoTone pair={H.about} locale={locale} id="shuaq-about" />
            <p className="shuaq-pill">{T.aboutPill[locale]}</p>
            {aboutText ? <p className="shuaq-text">{aboutText}</p> : null}
            {about ? <SiteLink href={`/${about.slug}`} locale={locale} className="shuaq-btn mt-6">{T.more[locale]}</SiteLink> : null}
          </div>
        </div>
      </section>

      {routine.length > 0 ? (
        <section className="shuaq-band" aria-labelledby="shuaq-routine">
          <HangingClouds className="shuaq-band-clouds" />
          <Plane className="shuaq-band-plane" />
          <div className="container-page relative py-16 text-center">
            <TwoTone pair={H.routine} locale={locale} id="shuaq-routine" light />
            <ol className="mx-auto mt-10 grid max-w-4xl gap-5 text-left sm:grid-cols-2">
              {routine.slice(0, 8).map((item) => (
                <li key={item.id} className="shuaq-routine-card">
                  <span className="flex-1">
                    <b>{pick(locale, item.titleKk, item.titleRu)}</b>
                    <span className="block">{item.time}</span>
                  </span>
                  <span className="shuaq-routine-icon"><Icon name={routineIcon(`${item.titleKk} ${item.titleRu}`)} className="h-6 w-6" /></span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {photos.length > 0 ? (
        <section className="container-page py-16 text-center" aria-labelledby="shuaq-gallery">
          <TwoTone pair={H.gallery} locale={locale} id="shuaq-gallery" />
          <ul className={`shuaq-masonry shuaq-masonry-${photos.length} mt-10`}>
            {photos.map((photo) => (
              <li key={photo.key}>
                <SiteLink href={`/${gallerySection?.slug ?? 'gallery'}/${photo.albumSlug}`} locale={locale} className="shuaq-masonry-item">
                  {/* eslint-disable-next-line @next/next/no-img-element -- медиа отдаёт свой роут */}
                  <img src={photo.src} alt={photo.title} loading="lazy" />
                </SiteLink>
              </li>
            ))}
          </ul>
          {gallerySection ? <SiteLink href={`/${gallerySection.slug}`} locale={locale} className="shuaq-btn mt-8">{T.allPhotos[locale]}</SiteLink> : null}
        </section>
      ) : null}

      {news.length > 0 ? (
        <section className="container-page py-12" aria-labelledby="shuaq-news">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <TwoTone pair={H.news} locale={locale} id="shuaq-news" />
            <SiteLink href="/news" locale={locale} className="shuaq-more">{BLOCK_T.allNews[locale]} →</SiteLink>
          </div>
          <div className="shuaq-news mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.slice(0, 3).map((post) => <NewsCard key={post.id} post={post} locale={locale} />)}
          </div>
        </section>
      ) : null}

      {reviews.length > 0 ? (
        <section className="shuaq-reviews" aria-labelledby="shuaq-reviews">
          <ThemeImage theme={THEME} name="hands" className="shuaq-reviews-photo" sizes="(min-width: 1024px) 45vw, 100vw" />
          <div className="shuaq-reviews-panel">
            <Cloud className="shuaq-reviews-cloud" />
            <TwoTone pair={H.reviews} locale={locale} id="shuaq-reviews" light />
            <ul className="shuaq-reviews-track">
              {reviews.slice(0, 6).map((review) => (
                <li key={review.id} className="shuaq-review">
                  <figure>
                    <figcaption className="flex items-center gap-4">
                      <span className="shuaq-review-avatar" aria-hidden>{review.authorName.charAt(0)}</span>
                      <span>
                        <b className="block">{review.authorName}</b>
                        {pick(locale, review.authorNoteKk, review.authorNoteRu) ? <span className="block text-sm opacity-90">{pick(locale, review.authorNoteKk, review.authorNoteRu)}</span> : null}
                        {review.rating ? <Stars rating={review.rating} locale={locale} /> : null}
                      </span>
                    </figcaption>
                    <blockquote className="mt-4">«{pick(locale, review.textKk, review.textRu)}»</blockquote>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </div>
  );
}
