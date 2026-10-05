import { NewsCard, SiteLink, T as BLOCK_T } from '@/components/site/blocks';
import { HeroButtons, HeroTitle } from '@/components/site/Hero';
import { Stars } from '@/components/site/sections';
import { EnrollLink, ThemeImage, developmentAreas, findSection } from '@/components/site/theme-kit';
import { homeStats } from '@/lib/home-stats';
import { AnnouncementsList, DocsTable, LatestPhotos } from '@/components/site/theme-blocks';
import { pick, type Locale } from '@/lib/i18n';
import { formatAgeRange } from '@/lib/labels';
import type { HomeProps } from '@/templates/types';
import { Butterfly, HeartLoop, Icon } from './Doodles';

const THEME = 'gulder';

type Pair = { kk: [string, string]; ru: [string, string] };

const H: Record<string, Pair> = {
  clubs: { kk: ['Біздің', 'үйірмелер'], ru: ['Наши', 'кружки'] },
  groups: { kk: ['Біздің', 'топтар'], ru: ['Наши', 'группы'] },
  reviews: { kk: ['Ата-аналардың', 'пікірлері'], ru: ['Отзывы', 'родителей'] },
  news: { kk: ['Біздің', 'жаңалықтар'], ru: ['Наши', 'новости'] },
  enroll: { kk: ['Балабақшаға', 'жазылу'], ru: ['Запись', 'в детский сад'] },
};

const T = {
  eyebrow: { kk: 'Бүлдіршіндерге арналған балабақша', ru: 'Детский сад для малышей' },
  enrollText: { kk: 'Сұрағыңызды жазыңыз немесе экскурсияға келіңіз — біз хабарласамыз.', ru: 'Напишите вопрос или приходите на экскурсию — мы свяжемся с вами.' },
} as const;

function Title({ pair, locale, id, className = '' }: { pair: Pair; locale: Locale; id: string; className?: string }) {
  const [first, accent] = pair[locale];
  return (
    <h2 id={id} className={`gulder-title ${className}`}>
      {first} <span className="gulder-pink">{accent}</span>
    </h2>
  );
}

const ACC_ICONS = ['bulb', 'palette', 'shield'];
const CARD_TONES = ['gulder-card-pink', 'gulder-card-magenta', 'gulder-card-violet'];
const TOYS = ['pyramid', 'cubes', 'top'];

const KP: Record<'ann' | 'photos' | 'docs', Pair> = {
  ann: { kk: ['Соңғы', 'хабарландырулар'], ru: ['Последние', 'объявления'] },
  photos: { kk: ['Біздің', 'фотогалерея'], ru: ['Наша', 'фотогалерея'] },
  docs: { kk: ['Соңғы', 'құжаттар'], ru: ['Последние', 'документы'] },
};

/**
 * Главная «Гүлдер» — вплотную к образцу №8: пастельный узор на фоне,
 * заголовок фиолетовым с малиновыми словами, справа коллаж — девочка
 * с ладошками в краске, два фото и малиновые круги-счётчики; голубая
 * облачная полоса с фото и аккордеоном; три цветные карточки с объёмными
 * игрушками; отзывы карточками; фото с подписями-таблетками и запись;
 * малиновый подвал. Фото и игрушки — сгенерированные.
 */
export function GulderHome({ profile, news, newsFeed, announcements = [], documents = [], photos = [], locale, hero, menu = [], clubs = [], groups = [], reviews = [], counts }: HomeProps) {
  const feed = (newsFeed ?? news).slice(0, 9);
  const kitAnn = findSection(menu, 'ANNOUNCEMENT');
  const kitGallery = findSection(menu, 'GALLERY');
  const kitDocs = findSection(menu, 'DOCUMENTS');
  const stats = homeStats(profile, counts, locale);
  const clubsSection = findSection(menu, 'CLUBS');
  const groupsSection = findSection(menu, 'GROUPS');
  const areas = developmentAreas(locale);
  const acc = ['logic', 'art', 'health'].map((key) => areas.find((area) => area.key === key)!);
  const aboutText = pick(locale, profile?.aboutKk, profile?.aboutRu);
  const cards = clubs.length > 0
    ? clubs.slice(0, 3).map((club) => ({ key: club.id, title: pick(locale, club.nameKk, club.nameRu), note: club.ageRange ?? '' }))
    : groups.slice(0, 3).map((group) => ({ key: group.id, title: pick(locale, group.nameKk, group.nameRu), note: formatAgeRange(group.ageFrom, group.ageTo, locale) ?? '' }));
  const cardsHref = clubs.length > 0 ? clubsSection : groupsSection;

  return (
    <div className="gulder-home">
      <section className="container-page gulder-hero">
        <div className="gulder-hero-text">
          <p className="gulder-eyebrow">{hero.eyebrow || T.eyebrow[locale]}</p>
          <HeroTitle hero={hero} tone="plain" withEyebrow={false} className="gulder-h1" />
          {hero.lead ? <p className="gulder-lead">{hero.lead}</p> : null}
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <HeroButtons hero={hero} tone="plain">
              <EnrollLink menu={menu} locale={locale} className="gulder-btn" />
            </HeroButtons>
          </div>
        </div>
        <div className="gulder-collage">
          <ThemeImage theme={THEME} name="hands" className="gulder-c-hands decor" sizes="(min-width: 1024px) 24vw, 60vw" eager />
          <ThemeImage theme={THEME} name="run" className="gulder-c-run decor" sizes="(min-width: 1024px) 16vw, 40vw" eager />
          <ThemeImage theme={THEME} name="globe" className="gulder-c-globe decor" sizes="(min-width: 1024px) 16vw, 40vw" eager />
          {stats[0] ? <p className="gulder-c-stat gulder-c-stat-1"><b>{stats[0].value}</b><span>{stats[0].label}</span></p> : null}
          {stats[1] ? <p className="gulder-c-stat gulder-c-stat-2"><b>{stats[1].value}</b><span>{stats[1].label}</span></p> : null}
        </div>
      </section>

      <section className="gulder-clouds" aria-label={areas[0].title}>
        <div className="container-page gulder-acc-wrap">
          <div className="gulder-paint">
            <ThemeImage theme={THEME} name="paint" className="gulder-paint-photo" sizes="(min-width: 1024px) 36vw, 100vw" />
            <HeartLoop className="gulder-heart" />
            <Butterfly className="gulder-fly-1" color="#A855F7" />
            <Butterfly className="gulder-fly-2" color="#EC4899" />
          </div>
          <div className="gulder-acc">
            {acc.map((item, index) => (
              // <details>: работает без скриптов; первый пункт открыт, как в образце.
              <details key={item.key} open={index === 0} className={index === acc.length - 1 ? 'gulder-acc-violet' : ''}>
                <summary>
                  <Icon name={ACC_ICONS[index % 3]} className="h-5 w-5 shrink-0" />
                  <span className="flex-1">{item.title}</span>
                  <span className="gulder-acc-sign" aria-hidden />
                </summary>
                <p>{index === 0 && aboutText ? aboutText : item.text}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {cards.length > 0 ? (
        <section className="container-page py-16 text-center" aria-labelledby="gulder-clubs">
          <Title pair={clubs.length > 0 ? H.clubs : H.groups} locale={locale} id="gulder-clubs" />
          <ul className="gulder-cards">
            {cards.map((card, index) => {
              const inner = (
                <>
                  <span className="gulder-card-text">
                    <b>«{card.title}»</b>
                    {card.note ? <span>{card.note}</span> : null}
                  </span>
                  <ThemeImage theme={THEME} name={TOYS[index % 3]} className="gulder-toy" sizes="8rem" />
                </>
              );
              return (
                <li key={card.key} className={`gulder-card ${CARD_TONES[index % 3]}`}>
                  {cardsHref ? <SiteLink href={`/${cardsHref.slug}`} locale={locale} className="gulder-card-inner">{inner}</SiteLink> : <span className="gulder-card-inner">{inner}</span>}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {reviews.length > 0 ? (
        <section className="container-page py-12 text-center" aria-labelledby="gulder-reviews">
          <Title pair={H.reviews} locale={locale} id="gulder-reviews" />
          <ul className="gulder-reviews">
            {reviews.slice(0, 3).map((review) => (
              <li key={review.id}>
                {review.rating ? <Stars rating={review.rating} locale={locale} /> : null}
                <blockquote>«{pick(locale, review.textKk, review.textRu)}»</blockquote>
                <p className="gulder-review-author">
                  <span className="gulder-avatar" aria-hidden>{review.authorName.trim().charAt(0)}</span>
                  <span>
                    <b className="block">{review.authorName}</b>
                    {pick(locale, review.authorNoteKk, review.authorNoteRu) ? <span className="text-sm">{pick(locale, review.authorNoteKk, review.authorNoteRu)}</span> : null}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {announcements.length > 0 ? (
        <section className="container-page py-12" aria-labelledby="gulder-ann">
          <Title pair={KP.ann} locale={locale} id="gulder-ann" />
          <div className="mt-8"><AnnouncementsList items={announcements} locale={locale} section={kitAnn} /></div>
        </section>
      ) : null}

      {feed.length > 0 ? (
        <section className="container-page py-12" aria-labelledby="gulder-news">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <Title pair={H.news} locale={locale} id="gulder-news" />
            <SiteLink href="/news" locale={locale} className="gulder-more">{BLOCK_T.allNews[locale]} →</SiteLink>
          </div>
          <div className="gulder-news mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {feed.map((post) => <NewsCard key={post.id} post={post} locale={locale} />)}
          </div>
        </section>
      ) : null}

      {photos.length > 0 ? (
        <section className="container-page py-12" aria-labelledby="gulder-photos">
          <Title pair={KP.photos} locale={locale} id="gulder-photos" />
          <div className="mt-8"><LatestPhotos photos={photos} locale={locale} gallerySection={kitGallery} /></div>
        </section>
      ) : null}

      {documents.length > 0 ? (
        <section className="container-page py-12" aria-labelledby="gulder-docs">
          <Title pair={KP.docs} locale={locale} id="gulder-docs" />
          <div className="mt-8"><DocsTable documents={documents} locale={locale} docsSection={kitDocs} /></div>
        </section>
      ) : null}

      <section className="container-page gulder-enroll" aria-labelledby="gulder-enroll">
        <div className="gulder-teach">
          <ThemeImage theme={THEME} name="teach" className="gulder-teach-photo" sizes="(min-width: 1024px) 36vw, 100vw" />
          {acc.map((item, index) => <span key={item.key} className={`gulder-tag gulder-tag-${index}`}>{item.title}</span>)}
        </div>
        <div className="gulder-enroll-text">
          <Title pair={H.enroll} locale={locale} id="gulder-enroll" />
          <p className="gulder-text mt-4">{T.enrollText[locale]}</p>
          <ul className="gulder-enroll-list">
            {profile?.phone ? <li><a href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`}>{profile.phone}</a></li> : null}
            {profile?.email ? <li><a href={`mailto:${profile.email}`} className="break-all">{profile.email}</a></li> : null}
            {profile?.workHours ? <li>{profile.workHours}</li> : null}
          </ul>
          <EnrollLink menu={menu} locale={locale} className="gulder-btn mt-6" />
        </div>
      </section>
    </div>
  );
}
