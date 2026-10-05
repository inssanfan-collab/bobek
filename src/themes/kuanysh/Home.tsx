import { NewsCard, SiteLink, T as BLOCK_T } from '@/components/site/blocks';
import { HeroButtons, HeroTitle } from '@/components/site/Hero';
import { Stars } from '@/components/site/sections';
import { EnrollLink, ThemeImage, aboutSection, developmentAreas, findSection } from '@/components/site/theme-kit';
import { homeStats } from '@/lib/home-stats';
import { AnnouncementsList, DocsTable, LatestPhotos } from '@/components/site/theme-blocks';
import { pick } from '@/lib/i18n';
import { formatAgeRange } from '@/lib/labels';
import type { HomeProps } from '@/templates/types';
import { CloudEdge, Icon, Plane, Rocket, Stripes } from './Doodles';

const THEME = 'kuanysh';

const T = {
  eyebrow: { kk: 'Бақытты балалық шақ осы жерден басталады', ru: 'Счастливое детство начинается здесь' },
  title: { kk: 'Өсеміз, ойнаймыз және әлемді қуана танимыз!', ru: 'Растём, играем и с радостью познаём мир!' },
  hours: { kk: 'Жұмыс уақыты:', ru: 'Режим работы:' },
  bandEyebrow: { kk: 'Есігіміз ашық', ru: 'Двери открыты' },
  band: { kk: 'Балабақшамен жақынырақ танысыңыз', ru: 'Познакомьтесь с детским садом поближе' },
  activities: { kk: 'Балаларға арналған сабақтарымыз', ru: 'Наши занятия для детей' },
  activitiesLead: { kk: 'Балаңыз балабақшада қандай қызықты жолдан өтетінін біліңіз.', ru: 'Узнайте, какой увлекательный путь пройдёт ваш ребёнок в нашем саду.' },
  reviewsEyebrow: { kk: 'Пікірлер', ru: 'Отклики и отзывы' },
  reviews: { kk: 'Ата-аналардың пікірлері', ru: 'Отзывы родителей' },
  apply: { kk: 'Балаңызды балабақшаға жазыңыз', ru: 'Запишите ребёнка в детский сад' },
  applyText: { kk: 'Сұрағыңызды жазыңыз немесе экскурсияға келіңіз — біз жауап береміз.', ru: 'Напишите нам вопрос или приходите на экскурсию — мы ответим.' },
  more: { kk: 'Толығырақ', ru: 'Подробнее' },
} as const;

const CARD_TONES = ['kuanysh-pink', 'kuanysh-mint', 'kuanysh-lemon'];
const CARD_ICONS = ['medal', 'blocks', 'game'];
const ACT_ICONS = ['game', 'book', 'slide', 'run'];
const STAT_TONES = ['kuanysh-mint', 'kuanysh-pink', 'kuanysh-lemon', 'kuanysh-sky'];

const K = {
  ann: { kk: 'Хабарландырулар', ru: 'Объявления' },
  annMark: { kk: 'Ақпарат', ru: 'Информация' },
  photos: { kk: 'Фотогалерея', ru: 'Фотогалерея' },
  photosMark: { kk: 'Сәттер', ru: 'Моменты' },
  docs: { kk: 'Соңғы құжаттар', ru: 'Последние документы' },
  docsMark: { kk: 'Құжаттар', ru: 'Документы' },
} as const;

/**
 * Главная «Қуаныш» — вплотную к образцу №4: фото малыша на фоне неба
 * с облачным краем, три облачные карточки, малыши-вырезка в жёлтом
 * кольце с часами работы, зелёная облачная полоса с девочкой, занятия
 * вокруг коллажа из трёх фото, отзыв в жёлтом облаке и счётчики
 * в цветных облачках, новости, фиолетовая плашка записи с нарисованными
 * детьми. Фото и рисунки — сгенерированные; тексты и данные — сада.
 */
export function KuanyshHome({ profile, news, newsFeed, announcements = [], documents = [], photos = [], locale, hero, menu, clubs = [], groups = [], reviews = [], counts }: HomeProps) {
  const feed = (newsFeed ?? news).slice(0, 9);
  const kitAnn = findSection(menu, 'ANNOUNCEMENT');
  const kitGallery = findSection(menu, 'GALLERY');
  const kitDocs = findSection(menu, 'DOCUMENTS');
  const stats = homeStats(profile, counts, locale);
  const about = aboutSection(menu);
  const clubsSection = findSection(menu, 'CLUBS');
  const aboutText = pick(locale, profile?.aboutKk, profile?.aboutRu);
  const areas = developmentAreas(locale);
  const area = (key: string) => areas.find((item) => item.key === key)!;
  const cards = ['health', 'social', 'logic'].map(area);
  const hours = (profile?.workHours ?? '').split(/[;\n]/).map((line) => line.trim()).filter(Boolean);
  const activities = clubs.length > 0
    ? clubs.slice(0, 4).map((club) => ({ key: club.id, title: pick(locale, club.nameKk, club.nameRu), text: pick(locale, club.descKk, club.descRu) }))
    : groups.length > 0
      ? groups.slice(0, 4).map((group) => ({ key: group.id, title: pick(locale, group.nameKk, group.nameRu), text: formatAgeRange(group.ageFrom, group.ageTo, locale) ?? '' }))
      : ['speech', 'art'].map(area);
  const half = Math.ceil(activities.length / 2);
  const activitiesHref = clubs.length > 0 && clubsSection ? `/${clubsSection.slug}` : null;

  const activity = (item: (typeof activities)[number], index: number) => (
    <li key={item.key} className="kuanysh-act">
      <span className="kuanysh-act-icon"><Icon name={ACT_ICONS[index % 4]} className="h-7 w-7" /></span>
      <span>
        <b>{item.title}</b>
        {item.text ? <span>{item.text}</span> : null}
      </span>
    </li>
  );

  return (
    <div className="kuanysh-home">
      <section className="kuanysh-hero">
        <ThemeImage theme={THEME} name="hero" className="kuanysh-hero-photo" sizes="100vw" eager />
        <div className="container-page kuanysh-hero-inner">
          <div className="kuanysh-hero-text">
            <HeroTitle hero={hero} tone="light" withEyebrow={false} className="kuanysh-h1" />
            {hero.lead ? <p className="kuanysh-lead">{hero.lead}</p> : null}
            <div className="mt-7 flex flex-wrap gap-3">
              <HeroButtons hero={hero} tone="light">
                <EnrollLink menu={menu} locale={locale} className="kuanysh-btn" />
              </HeroButtons>
            </div>
          </div>
        </div>
        <CloudEdge className="kuanysh-hero-edge" />
      </section>

      <ul className="container-page kuanysh-clouds">
        {cards.map((card, index) => {
          const inner = (
            <>
              <span className="kuanysh-cloud-icon"><Icon name={CARD_ICONS[index % 3]} className="h-8 w-8" /></span>
              <b>{card.title}</b>
              <span>{card.text}</span>
              <span className="kuanysh-cloud-go" aria-hidden><Icon name="arrow" className="h-4 w-4" /></span>
            </>
          );
          return (
            <li key={card.key} className={`kuanysh-cloud ${CARD_TONES[index % 3]}`}>
              {about ? <SiteLink href={`/${about.slug}`} locale={locale} className="kuanysh-cloud-inner">{inner}</SiteLink> : <span className="kuanysh-cloud-inner">{inner}</span>}
            </li>
          );
        })}
      </ul>

      <section className="container-page kuanysh-split" aria-labelledby="kuanysh-about">
        <div className="kuanysh-split-art">
          <span className="kuanysh-ring" aria-hidden />
          <span className="kuanysh-play" aria-hidden />
          <ThemeImage theme={THEME} name="toddlers" className="kuanysh-toddlers" sizes="(min-width: 1024px) 45vw, 95vw" />
        </div>
        <div>
          <p className="kuanysh-eyebrow">{T.eyebrow[locale]}</p>
          <h2 id="kuanysh-about" className="kuanysh-title kuanysh-green">{T.title[locale]}</h2>
          {aboutText ? <p className="kuanysh-text mt-5">{aboutText}</p> : null}
          {hours.length > 0 ? (
            <>
              <p className="mt-6 font-bold">{T.hours[locale]}</p>
              <ul className="kuanysh-hours">
                {hours.map((line) => <li key={line}>{line}</li>)}
              </ul>
            </>
          ) : null}
          {about ? <SiteLink href={`/${about.slug}`} locale={locale} className="kuanysh-btn mt-7">{T.more[locale]}</SiteLink> : null}
        </div>
      </section>

      <section className="kuanysh-band" aria-labelledby="kuanysh-band">
        <div className="kuanysh-band-cloud">
          <Rocket className="kuanysh-rocket" />
          <div className="kuanysh-band-text">
            <p className="kuanysh-band-eyebrow">{T.bandEyebrow[locale]}</p>
            <h2 id="kuanysh-band" className="kuanysh-band-title">{T.band[locale]}</h2>
            <EnrollLink menu={menu} locale={locale} className="kuanysh-btn mt-6" />
          </div>
          <ThemeImage theme={THEME} name="heart" className="kuanysh-heart" sizes="(min-width: 1024px) 30vw, 70vw" />
        </div>
        <Plane className="kuanysh-plane" />
      </section>

      {activities.length > 0 ? (
        <section className="container-page kuanysh-acts" aria-labelledby="kuanysh-acts">
          <Stripes />
          <h2 id="kuanysh-acts" className="kuanysh-title mt-3 text-center">{T.activities[locale]}</h2>
          <p className="kuanysh-text mx-auto mt-3 max-w-xl text-center">{T.activitiesLead[locale]}</p>
          <div className="kuanysh-acts-grid">
            <ul className="kuanysh-acts-col">{activities.slice(0, half).map((item, index) => activity(item, index))}</ul>
            <div className="kuanysh-collage" aria-hidden>
              <ThemeImage theme={THEME} name="act1" sizes="14rem" />
              <ThemeImage theme={THEME} name="act2" sizes="16rem" />
              <ThemeImage theme={THEME} name="act3" sizes="16rem" />
            </div>
            <ul className="kuanysh-acts-col">{activities.slice(half).map((item, index) => activity(item, index + half))}</ul>
          </div>
          {activitiesHref ? <p className="mt-8 text-center"><SiteLink href={activitiesHref} locale={locale} className="kuanysh-btn">{T.more[locale]}</SiteLink></p> : null}
        </section>
      ) : null}

      {reviews.length > 0 || stats.length > 0 ? (
        <section className="container-page kuanysh-reviews" aria-labelledby="kuanysh-reviews">
          <div className="min-w-0">
            <p className="kuanysh-eyebrow">{T.reviewsEyebrow[locale]}</p>
            <h2 id="kuanysh-reviews" className="kuanysh-title">{T.reviews[locale]}</h2>
            {reviews.length > 0 ? (
              <ul className="kuanysh-review-track">
                {reviews.slice(0, 6).map((review) => (
                  <li key={review.id} className="kuanysh-review">
                    <figure>
                      <span className="kuanysh-quote" aria-hidden>“</span>
                      <blockquote>{pick(locale, review.textKk, review.textRu)}</blockquote>
                      <figcaption>
                        {review.rating ? <Stars rating={review.rating} locale={locale} /> : null}
                        <b>{review.authorName}</b>
                        {pick(locale, review.authorNoteKk, review.authorNoteRu) ? <span className="block text-sm">{pick(locale, review.authorNoteKk, review.authorNoteRu)}</span> : null}
                      </figcaption>
                    </figure>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          {stats.length > 0 ? (
            <ul className="kuanysh-stats">
              {stats.map((stat, index) => (
                <li key={stat.label} className={`kuanysh-stat ${STAT_TONES[index % 4]}`}>
                  <b>{stat.value}</b>
                  <span>{stat.label}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {announcements.length > 0 ? (
        <section className="container-page py-12" aria-labelledby="kuanysh-ann">
          <Stripes />
          <h2 id="kuanysh-ann" className="kuanysh-title mt-3 text-center">{K.ann[locale]}</h2>
          <div className="mt-8"><AnnouncementsList items={announcements} locale={locale} section={kitAnn} /></div>
        </section>
      ) : null}

      {feed.length > 0 ? (
        <section className="container-page py-12" aria-labelledby="kuanysh-news">
          <Stripes />
          <h2 id="kuanysh-news" className="kuanysh-title mt-3 text-center">{BLOCK_T.news[locale]}</h2>
          <div className="kuanysh-news mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {feed.map((post) => <NewsCard key={post.id} post={post} locale={locale} />)}
          </div>
          <p className="mt-8 text-center"><SiteLink href="/news" locale={locale} className="kuanysh-btn">{BLOCK_T.allNews[locale]}</SiteLink></p>
        </section>
      ) : null}

      {photos.length > 0 ? (
        <section className="container-page py-12" aria-labelledby="kuanysh-photos">
          <Stripes />
          <h2 id="kuanysh-photos" className="kuanysh-title mt-3 text-center">{K.photos[locale]}</h2>
          <div className="mt-8"><LatestPhotos photos={photos} locale={locale} gallerySection={kitGallery} /></div>
        </section>
      ) : null}

      {documents.length > 0 ? (
        <section className="container-page py-12" aria-labelledby="kuanysh-docs">
          <Stripes />
          <h2 id="kuanysh-docs" className="kuanysh-title mt-3 text-center">{K.docs[locale]}</h2>
          <div className="mt-8"><DocsTable documents={documents} locale={locale} docsSection={kitDocs} /></div>
        </section>
      ) : null}

      <section className="container-page kuanysh-apply" aria-labelledby="kuanysh-apply">
        <div className="kuanysh-apply-card">
          <h2 id="kuanysh-apply" className="kuanysh-apply-title">{T.apply[locale]}</h2>
          <p className="mt-3">{T.applyText[locale]}</p>
          <EnrollLink menu={menu} locale={locale} className="kuanysh-btn mt-6" />
        </div>
        <ThemeImage theme={THEME} name="kids" className="kuanysh-kids decor" sizes="(min-width: 1024px) 70rem, 100vw" />
      </section>
    </div>
  );
}
