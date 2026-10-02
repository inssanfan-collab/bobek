import { NewsCard, SiteLink, T as BLOCK_T } from '@/components/site/blocks';
import { HeroButtons, HeroTitle } from '@/components/site/Hero';
import { StatsRow } from '@/components/site/home-blocks';
import { FaqList, ReviewList } from '@/components/site/sections';
import { CoverOr, EnrollLink, SectionHead, ThemeImage, aboutSection, developmentAreas } from '@/components/site/theme-kit';
import { homeStats } from '@/lib/home-stats';
import { pick } from '@/lib/i18n';
import type { HomeProps } from '@/templates/types';

const THEME = 'jasyl';

const T = {
  about: { kk: 'Біз туралы', ru: 'О нас' },
  aboutTitle: { kk: 'Бақытты балалық шақ осы жерден басталады', ru: 'Счастливое детство начинается здесь' },
  more: { kk: 'Толығырақ', ru: 'Подробнее' },
  family: { kk: 'Біздің үлкен отбасымызға қосылыңыз!', ru: 'Присоединяйтесь к нашей большой семье!' },
  why: { kk: 'Балаңыздың жарқын болашағына сенімді қадам', ru: 'Уверенный шаг к яркому будущему ребёнка' },
  whyEyebrow: { kk: 'Неге бізді таңдайды', ru: 'Почему выбирают нас' },
  routine: { kk: 'Біздің күн тәртібі', ru: 'Наш распорядок дня' },
  faq: { kk: 'Жиі қойылатын сұрақтар', ru: 'Частые вопросы' },
  reviews: { kk: 'Ата-аналардың пікірлері', ru: 'Отзывы родителей' },
} as const;

const CARD_IMAGES = ['blocks', 'hero', 'ball', 'walk'];

/**
 * Главная «Жасыл» — свежая зелёная (структура дизайна №2): фото-баннер
 * с зелёной плашкой, «О нас» с коллажем и счётчиками, четыре цветные
 * карточки (кружки или направления ГОСО), «Почему мы» с фото, распорядок
 * таблицей на зелёной полосе, частые вопросы, новости, отзывы.
 */
export function JasylHome({ profile, news, locale, coverUrl, coverPosition, hero, menu, clubs = [], routine = [], faq = [], reviews = [], counts }: HomeProps) {
  const stats = homeStats(profile, counts, locale);
  const about = aboutSection(menu);
  const aboutText = pick(locale, profile?.aboutKk, profile?.aboutRu);
  const areas = developmentAreas(locale);
  const cards = clubs.length > 0
    ? clubs.slice(0, 4).map((club, index) => ({ key: club.id, title: pick(locale, club.nameKk, club.nameRu), text: pick(locale, club.descKk, club.descRu), image: CARD_IMAGES[index % 4] }))
    : areas.slice(0, 4).map((area, index) => ({ ...area, image: CARD_IMAGES[index % 4] }));

  return (
    <div className="jasyl-home">
      <section className="container-page pt-6 lg:pt-10">
        <div className="jasyl-hero">
          <CoverOr coverUrl={coverUrl} coverPosition={coverPosition} theme={THEME} name="hero" className="jasyl-hero-photo" eager />
          <div className="jasyl-hero-box">
            {hero.eyebrow ? <p className="jasyl-chip">{hero.eyebrow}</p> : null}
            <HeroTitle hero={hero} tone="plain" withEyebrow={false} className="jasyl-h1 font-display" />
            {hero.lead ? <p className="jasyl-lead">{hero.lead}</p> : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <HeroButtons hero={hero} tone="plain">
                <EnrollLink menu={menu} locale={locale} className="jasyl-white-btn" />
              </HeroButtons>
            </div>
          </div>
        </div>
      </section>

      <section className="jasyl-section" aria-labelledby="jasyl-about">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2">
          <div className="jasyl-collage">
            <ThemeImage theme={THEME} name="blocks" sizes="(min-width: 1024px) 25vw, 50vw" />
            <ThemeImage theme={THEME} name="ball" sizes="(min-width: 1024px) 25vw, 50vw" />
            <ThemeImage theme={THEME} name="hero" sizes="(min-width: 1024px) 25vw, 50vw" />
            <ThemeImage theme={THEME} name="walk" sizes="(min-width: 1024px) 25vw, 50vw" />
          </div>
          <div>
            <SectionHead id="jasyl-about" eyebrow={T.about[locale]} title={T.aboutTitle[locale]} />
            {aboutText && aboutText !== hero.lead ? <p className="jasyl-text mt-4">{aboutText}</p> : null}
            <StatsRow stats={stats} className="jasyl-stats" />
            {about ? <SiteLink href={`/${about.slug}`} locale={locale} className="btn-primary mt-7 inline-flex">{T.more[locale]} →</SiteLink> : null}
          </div>
        </div>
      </section>

      <section className="jasyl-section jasyl-soft" aria-labelledby="jasyl-family">
        <div className="container-page">
          <SectionHead id="jasyl-family" title={T.family[locale]} className="kit-head text-center" />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
              <li key={card.key} className="jasyl-card">
                <ThemeImage theme={THEME} name={card.image} className="jasyl-card-photo" sizes="(min-width: 1024px) 25vw, 50vw" />
                <div className="p-5">
                  <h3 className="jasyl-card-title">{card.title}</h3>
                  {card.text ? <p className="jasyl-card-text">{card.text}</p> : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="jasyl-section" aria-labelledby="jasyl-why">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionHead id="jasyl-why" eyebrow={T.whyEyebrow[locale]} title={T.why[locale]} />
            <ul className="mt-6 space-y-3">
              {areas.map((area) => (
                <li key={area.key} className="jasyl-why-item">
                  <b>{area.title}</b>
                  <span>{area.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <ThemeImage theme={THEME} name="walk" className="jasyl-why-photo" />
        </div>
      </section>

      {routine.length > 0 ? (
        <section className="jasyl-routine" aria-labelledby="jasyl-routine">
          <div className="container-page py-16">
            <div className="jasyl-table">
              <SectionHead id="jasyl-routine" title={T.routine[locale]} className="kit-head text-center" />
              <ol className="mt-6">
                {routine.map((item) => (
                  <li key={item.id} className="jasyl-row">
                    <span className="jasyl-row-time">{item.time}</span>
                    <span>{pick(locale, item.titleKk, item.titleRu)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      ) : null}

      {faq.length > 0 ? (
        <section className="jasyl-section" aria-labelledby="jasyl-faq">
          <div className="container-page grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <ThemeImage theme={THEME} name="blocks" className="jasyl-why-photo" />
            <div>
              <SectionHead id="jasyl-faq" title={T.faq[locale]} />
              <div className="jasyl-faq mt-6"><FaqList items={faq.slice(0, 6)} locale={locale} /></div>
            </div>
          </div>
        </section>
      ) : null}

      {news.length > 0 ? (
        <section className="jasyl-section jasyl-soft" aria-labelledby="jasyl-news">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <SectionHead id="jasyl-news" title={BLOCK_T.news[locale]} />
              <SiteLink href="/news" locale={locale} className="jasyl-more">{BLOCK_T.allNews[locale]} →</SiteLink>
            </div>
            <div className="jasyl-news mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news.slice(0, 3).map((post) => <NewsCard key={post.id} post={post} locale={locale} />)}
            </div>
          </div>
        </section>
      ) : null}

      {reviews.length > 0 ? (
        <section className="jasyl-section" aria-labelledby="jasyl-reviews">
          <div className="container-page">
            <SectionHead id="jasyl-reviews" title={T.reviews[locale]} className="kit-head text-center" />
            <ReviewList reviews={reviews.slice(0, 3)} locale={locale} className="jasyl-reviews mt-10 grid gap-6 md:grid-cols-3" />
          </div>
        </section>
      ) : null}
    </div>
  );
}
