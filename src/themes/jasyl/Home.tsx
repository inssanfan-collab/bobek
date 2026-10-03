import { NewsCard, SiteLink, T as BLOCK_T } from '@/components/site/blocks';
import { HeroButtons, HeroTitle } from '@/components/site/Hero';
import { Stars } from '@/components/site/sections';
import { CoverOr, EnrollLink, ThemeImage, aboutSection, developmentAreas, findSection } from '@/components/site/theme-kit';
import { homeStats } from '@/lib/home-stats';
import { pick, type Locale } from '@/lib/i18n';
import { formatAgeRange } from '@/lib/labels';
import type { HomeProps } from '@/templates/types';
import { Alarm, Bell, Check, Chevron, Dots, Icon } from './Doodles';

const THEME = 'jasyl';

type Pair = { kk: [string, string]; ru: [string, string] };

const H: Record<string, Pair> = {
  about: { kk: ['Бақытты балалық шақ', 'осы жерден басталады'], ru: ['Счастливое детство', 'начинается здесь'] },
};

const T = {
  aboutEyebrow: { kk: 'Біз туралы', ru: 'О нас' },
  family: { kk: 'Біздің үлкен отбасымызға қосылыңыз!', ru: 'Присоединяйтесь к нашей большой семье!' },
  familyLead: { kk: 'Әр бүлдіршін біз үшін ерекше — оның қызығушылығы мен дамуына барлық жағдай жасалған.', ru: 'Каждый малыш для нас особенный — для его интересов и развития созданы все условия.' },
  why: { kk: 'Балаңыздың жарқын болашағына жасалған сенімді қадам', ru: 'Уверенный шаг к яркому будущему ребёнка' },
  routine: { kk: 'Біздің күн тәртібі', ru: 'Наш распорядок дня' },
  faq: { kk: 'Жиі қойылатын сұрақтар', ru: 'Частые вопросы' },
  reviewsEyebrow: { kk: 'Балабақша туралы', ru: 'О детском саде' },
  reviews: { kk: 'Ата-аналардың пікірлері', ru: 'Отзывы родителей' },
  newsLead: { kk: 'Балабақшамыздың жаңалықтарынан, іс-шаралары мен күнтізбе өзгерістерінен хабардар болу үшін', ru: 'Чтобы быть в курсе новостей детского сада, мероприятий и изменений в расписании' },
  news: { kk: 'Жаңалықтарымызды оқыңыз!', ru: 'Читайте наши новости!' },
  more: { kk: 'Толығырақ', ru: 'Подробнее' },
  hours: { kk: 'Жұмыс уақыты', ru: 'Время работы' },
  places: { kk: 'Орын саны', ru: 'Мест в саду' },
  languages: { kk: 'Оқыту тілі', ru: 'Язык обучения' },
  kk: { kk: 'қазақ', ru: 'казахский' },
  ru: { kk: 'орыс', ru: 'русский' },
} as const;

function Title({ pair, locale, id }: { pair: Pair; locale: Locale; id: string }) {
  const [first, accent] = pair[locale];
  return (
    <h2 id={id} className="jasyl-title">
      {first} <span className="jasyl-red">{accent}</span>
    </h2>
  );
}

const CARD_IMAGES = ['play', 'care', 'crafts', 'climb'];
const CARD_ICONS = ['puzzle', 'hands', 'music', 'shield'];
const STAT_ICONS = ['home', 'teacher', 'hands'];

/**
 * Главная «Жасыл» — вплотную к образцу №2: фото на всю ширину с зелёной
 * плашкой, коллаж 2×2 с голубыми перемычками и счётчиками, четыре карточки
 * с цветным низом и белым значком, «Почему мы» с фото в кляксе, распорядок
 * в зелёной плашке поверх фото с красками, частые вопросы (первый открыт),
 * отзыв в голубой кляксе, новости и дети, нарисованные мелками.
 * Фото и рисунки — сгенерированные; тексты и данные — сада.
 */
export function JasylHome({ profile, news, locale, coverUrl, coverPosition, hero, menu, clubs = [], groups = [], routine = [], faq = [], reviews = [], counts }: HomeProps) {
  const stats = homeStats(profile, counts, locale).slice(0, 3);
  const about = aboutSection(menu);
  const clubsSection = findSection(menu, 'CLUBS');
  const aboutText = pick(locale, profile?.aboutKk, profile?.aboutRu);
  const cards = clubs.length > 0
    ? clubs.slice(0, 4).map((club) => ({ key: club.id, title: pick(locale, club.nameKk, club.nameRu), text: pick(locale, club.descKk, club.descRu) }))
    : developmentAreas(locale, 4);
  const cardHref = clubsSection ? `/${clubsSection.slug}` : about ? `/${about.slug}` : null;

  // Галочки «Почему мы» — только правда о саде: группы с возрастом,
  // а без групп — часы, места и языки из паспорта.
  const checks: string[] = [];
  if (groups.length > 0) {
    for (const group of groups.slice(0, 5)) {
      const age = formatAgeRange(group.ageFrom, group.ageTo, locale);
      checks.push(`${pick(locale, group.nameKk, group.nameRu)}${age ? ` — ${age}` : ''}`);
    }
  } else {
    if (profile?.workHours) checks.push(`${T.hours[locale]}: ${profile.workHours}`);
    if (profile?.placesTotal) checks.push(`${T.places[locale]}: ${profile.placesTotal}`);
    const langs = [profile?.langKk ? T.kk[locale] : null, profile?.langRu ? T.ru[locale] : null].filter(Boolean);
    if (langs.length > 0) checks.push(`${T.languages[locale]}: ${langs.join(', ')}`);
  }

  return (
    <div className="jasyl-home">
      <section className="jasyl-hero">
        <ThemeImage theme={THEME} name="hero" className="jasyl-hero-photo" sizes="100vw" eager />
        <div className="jasyl-hero-panel">
          <HeroTitle hero={hero} tone="light" withEyebrow={false} className="jasyl-h1" />
          {hero.eyebrow ? <p className="jasyl-hero-sub">{hero.eyebrow}</p> : hero.lead ? <p className="jasyl-hero-lead">{hero.lead}</p> : null}
          <span className="jasyl-hero-line" aria-hidden />
          <div className="mt-6 flex flex-wrap gap-3">
            <HeroButtons hero={hero} tone="light">
              <EnrollLink menu={menu} locale={locale} className="jasyl-white-btn" />
            </HeroButtons>
          </div>
        </div>
      </section>

      <section className="container-page jasyl-about" aria-labelledby="jasyl-about">
        <ul className="jasyl-collage" aria-hidden>
          <li><ThemeImage theme={THEME} name="yard" sizes="(min-width: 1024px) 22vw, 45vw" /></li>
          <li><ThemeImage theme={THEME} name="table" sizes="(min-width: 1024px) 22vw, 45vw" /></li>
          <li><ThemeImage theme={THEME} name="football" sizes="(min-width: 1024px) 22vw, 45vw" /></li>
          <li><ThemeImage theme={THEME} name="desk" sizes="(min-width: 1024px) 22vw, 45vw" /></li>
        </ul>
        <div>
          <p className="jasyl-eyebrow">{T.aboutEyebrow[locale]}</p>
          <Title pair={H.about} locale={locale} id="jasyl-about" />
          {aboutText ? <p className="jasyl-text mt-5">{aboutText}</p> : null}
          {stats.length > 0 ? (
            <ul className="jasyl-stats">
              {stats.map((stat, index) => (
                <li key={stat.label}>
                  <span className="jasyl-stat-icon"><Icon name={STAT_ICONS[index % 3]} className="h-7 w-7" /></span>
                  <span>
                    <b>{stat.value}</b>
                    <span>{stat.label}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          {about ? <SiteLink href={`/${about.slug}`} locale={locale} className="jasyl-btn mt-7">{T.more[locale]}</SiteLink> : null}
        </div>
      </section>

      <section className="container-page jasyl-family" aria-labelledby="jasyl-family">
        <Dots />
        <h2 id="jasyl-family" className="jasyl-title jasyl-red mt-3 text-center">{T.family[locale]}</h2>
        <p className="jasyl-family-lead">{T.familyLead[locale]}</p>
        <ul className="jasyl-cards">
          {cards.map((card, index) => {
            const inner = (
              <>
                <ThemeImage theme={THEME} name={CARD_IMAGES[index % 4]} className="jasyl-card-photo" sizes="(min-width: 1024px) 25vw, 50vw" />
                <span className="jasyl-card-body">
                  <span className="jasyl-card-icon"><Icon name={CARD_ICONS[index % 4]} className="h-8 w-8" /></span>
                  <span className="jasyl-card-title">{card.title}</span>
                  {card.text ? <span className="jasyl-card-text">{card.text}</span> : null}
                </span>
              </>
            );
            return (
              <li key={card.key} className={`jasyl-card jasyl-card-${index % 4}`}>
                {cardHref ? <SiteLink href={cardHref} locale={locale} className="block h-full">{inner}</SiteLink> : inner}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="container-page jasyl-why" aria-labelledby="jasyl-why">
        <div>
          <h2 id="jasyl-why" className="jasyl-title jasyl-blue">{T.why[locale]}</h2>
          {hero.lead && hero.lead !== aboutText ? <p className="jasyl-text mt-4">{hero.lead}</p> : null}
          {checks.length > 0 ? (
            <ul className="jasyl-checks">
              {checks.map((check) => <li key={check}><Check />{check}</li>)}
            </ul>
          ) : null}
        </div>
        <div className="jasyl-why-art">
          <span className="jasyl-why-arc" aria-hidden />
          <CoverOr coverUrl={coverUrl} coverPosition={coverPosition} theme={THEME} name="cut" className="jasyl-why-photo" />
        </div>
      </section>

      {routine.length > 0 ? (
        <section className="jasyl-routine" aria-labelledby="jasyl-routine">
          <ThemeImage theme={THEME} name="paint" className="jasyl-routine-photo" sizes="100vw" />
          <div className="container-page relative py-16">
            <div className="jasyl-routine-panel">
              <span className="jasyl-alarm"><Alarm /></span>
              <h2 id="jasyl-routine" className="jasyl-routine-title">{T.routine[locale]}</h2>
              <ol className="jasyl-rows">
                {routine.map((item) => (
                  <li key={item.id}>
                    <span>{pick(locale, item.titleKk, item.titleRu)}</span>
                    <span>{item.time}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      ) : null}

      {faq.length > 0 ? (
        <section className="container-page jasyl-faq-wrap" aria-labelledby="jasyl-faq">
          <div className="jasyl-faq-art">
            <span className="jasyl-faq-blob" aria-hidden />
            <ThemeImage theme={THEME} name="dough" className="jasyl-faq-photo" sizes="(min-width: 1024px) 40vw, 100vw" />
          </div>
          <div>
            <h2 id="jasyl-faq" className="jasyl-title jasyl-red">{T.faq[locale]}</h2>
            <div className="jasyl-faq mt-6">
              {faq.slice(0, 6).map((item, index) => (
                // <details>: работает без скриптов и с клавиатуры; первый открыт, как в образце.
                <details key={item.id} open={index === 0}>
                  <summary>
                    <span>{pick(locale, item.questionKk, item.questionRu)}</span>
                    <span className="jasyl-faq-chevron"><Chevron /></span>
                  </summary>
                  {pick(locale, item.answerKk, item.answerRu) ? <p>{pick(locale, item.answerKk, item.answerRu)}</p> : null}
                </details>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {reviews.length > 0 ? (
        <section className="jasyl-reviews" aria-labelledby="jasyl-reviews">
          <div className="container-page grid items-center gap-10 py-16 lg:grid-cols-2">
            <div className="min-w-0">
              <p className="jasyl-eyebrow jasyl-blue text-center">{T.reviewsEyebrow[locale]}</p>
              <h2 id="jasyl-reviews" className="jasyl-title jasyl-red text-center">{T.reviews[locale]}</h2>
              <ul className="jasyl-reviews-track">
                {reviews.slice(0, 6).map((review) => (
                  <li key={review.id} className="jasyl-review">
                    <figure>
                      <span className="jasyl-quote" aria-hidden>“</span>
                      <figcaption>
                        <b>{review.authorName}</b>
                        {pick(locale, review.authorNoteKk, review.authorNoteRu) ? <span className="block text-sm">{pick(locale, review.authorNoteKk, review.authorNoteRu)}</span> : null}
                        {review.rating ? <Stars rating={review.rating} locale={locale} /> : null}
                      </figcaption>
                      <blockquote>«{pick(locale, review.textKk, review.textRu)}»</blockquote>
                    </figure>
                  </li>
                ))}
              </ul>
            </div>
            <ThemeImage theme={THEME} name="boardgame" className="jasyl-reviews-photo" sizes="(min-width: 1024px) 45vw, 100vw" />
          </div>
        </section>
      ) : null}

      <section className="jasyl-news-band" aria-labelledby={news.length > 0 ? 'jasyl-news' : undefined}>
        {news.length > 0 ? (
          <div className="container-page pt-16 text-center">
            <Bell />
            <p className="jasyl-news-lead">{T.newsLead[locale]}</p>
            <h2 id="jasyl-news" className="jasyl-title jasyl-pink">{T.news[locale]}</h2>
            <div className="jasyl-news mt-8 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
              {news.slice(0, 3).map((post) => <NewsCard key={post.id} post={post} locale={locale} />)}
            </div>
            <SiteLink href="/news" locale={locale} className="jasyl-btn mt-8">{BLOCK_T.allNews[locale]}</SiteLink>
          </div>
        ) : null}
        <ThemeImage theme={THEME} name="kids" className="jasyl-kids decor" sizes="100vw" />
      </section>
    </div>
  );
}
