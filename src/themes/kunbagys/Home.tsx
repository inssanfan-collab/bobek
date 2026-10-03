import { NewsCard, SiteLink, T as BLOCK_T } from '@/components/site/blocks';
import { HeroButtons, HeroTitle } from '@/components/site/Hero';
import { Stars } from '@/components/site/sections';
import { CoverOr, EnrollLink, ThemeImage, aboutSection, developmentAreas, findSection } from '@/components/site/theme-kit';
import { homeStats } from '@/lib/home-stats';
import { pick } from '@/lib/i18n';
import { formatAgeRange } from '@/lib/labels';
import type { HomeProps } from '@/templates/types';

const THEME = 'kunbagys';

const T = {
  welcomeMark: { kk: 'Біздің балабақшаға', ru: 'В наш детский сад' },
  welcome: { kk: 'Қош келдіңіздер', ru: 'Добро пожаловать' },
  why: { kk: 'Бізді не үшін таңдайды:', ru: 'Почему выбирают нас:' },
  programsMark: { kk: 'Білім беру', ru: 'Образование' },
  programs: { kk: 'Біздің бағдарламалар', ru: 'Наши программы' },
  more: { kk: 'Толығырақ', ru: 'Подробнее' },
  pricesMark: { kk: 'Қызметтеріміз', ru: 'Наших услуг' },
  prices: { kk: 'Құны', ru: 'Стоимость' },
  groupsMark: { kk: 'Жас топтары', ru: 'Возрастные группы' },
  groups: { kk: 'Біздің топтар', ru: 'Наши группы' },
  reviewsMark: { kk: 'Ата-аналар', ru: 'Родителей' },
  reviews: { kk: 'Пікірлер', ru: 'Отзывы' },
  newsMark: { kk: 'Өміріміз', ru: 'Наша жизнь' },
  hours: { kk: 'Жұмыс уақыты', ru: 'Время работы' },
  places: { kk: 'Орын саны', ru: 'Мест в саду' },
  languages: { kk: 'Оқыту тілі', ru: 'Язык обучения' },
  kk: { kk: 'қазақ', ru: 'казахский' },
  ru: { kk: 'орыс', ru: 'русский' },
  language: { kk: 'Оқыту тілі', ru: 'Язык обучения' },
  teachers: { kk: 'Тәрбиешілер', ru: 'Воспитатели' },
  free: { kk: 'Бос орын', ru: 'Свободных мест' },
  age: { kk: 'Жасы', ru: 'Возраст' },
} as const;

/** Заголовок образца: крупное бледное слово позади, оранжевый заголовок поверх. */
function Heading({ mark, title, id }: { mark: string; title: string; id: string }) {
  return (
    <div className="kunbagys-heading">
      <span className="kunbagys-mark" aria-hidden>{mark}</span>
      <h2 id={id} className="kunbagys-title">{title}</h2>
    </div>
  );
}

const TOYS = ['ball', 'bear', 'train', 'rattle'];

type Tab = { key: string; title: string; lines: string[]; price?: string };

/**
 * Главная «Күнбағыс» — вплотную к образцу №10: оранжевая полоса,
 * разноцветное название и меню со значками, фото детей с ладошками
 * в краске на всю ширину и заголовок на оранжевой плашке; «Қош
 * келдіңіздер» с бледным словом позади, двумя фото и списком; четыре
 * программы с объёмными игрушками на узоре из рисунков; стоимость
 * вкладками (у государственного сада — группы); отзывы; оранжевый подвал.
 */
export function KunbagysHome({ profile, news, locale, coverUrl, coverPosition, hero, menu, clubs = [], groups = [], prices = [], reviews = [], counts }: HomeProps) {
  const about = aboutSection(menu);
  const clubsSection = findSection(menu, 'CLUBS');
  const aboutText = pick(locale, profile?.aboutKk, profile?.aboutRu);
  const stats = homeStats(profile, counts, locale);
  const programs = clubs.length > 0
    ? clubs.slice(0, 4).map((club) => ({ key: club.id, title: pick(locale, club.nameKk, club.nameRu), text: pick(locale, club.descKk, club.descRu) }))
    : developmentAreas(locale, 4);
  const programsHref = clubs.length > 0 && clubsSection ? `/${clubsSection.slug}` : about ? `/${about.slug}` : null;

  // «Почему мы» — только правда из паспорта сада и счётчиков.
  const why: string[] = [];
  if (profile?.workHours) why.push(`${T.hours[locale]}: ${profile.workHours}`);
  const langs = [profile?.langKk ? T.kk[locale] : null, profile?.langRu ? T.ru[locale] : null].filter(Boolean);
  if (langs.length > 0) why.push(`${T.languages[locale]}: ${langs.join(', ')}`);
  for (const stat of stats) why.push(`${stat.value} ${stat.label}`);

  // Вкладки: тарифы частного сада, у государственного — группы.
  const tabs: Tab[] = prices.length > 0
    ? prices.slice(0, 4).map((plan) => ({
        key: plan.id,
        title: pick(locale, plan.nameKk, plan.nameRu),
        price: `${plan.priceKzt.toLocaleString('ru-RU')} ₸${pick(locale, plan.periodKk, plan.periodRu) ? ` / ${pick(locale, plan.periodKk, plan.periodRu)}` : ''}`,
        lines: (pick(locale, plan.featuresKk, plan.featuresRu) ?? '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
      }))
    : groups.slice(0, 4).map((group) => ({
        key: group.id,
        title: pick(locale, group.nameKk, group.nameRu),
        lines: [
          formatAgeRange(group.ageFrom, group.ageTo, locale) ? `${T.age[locale]}: ${formatAgeRange(group.ageFrom, group.ageTo, locale)}` : '',
          `${T.language[locale]}: ${group.language === 'ru' ? T.ru[locale] : T.kk[locale]}`,
          group.teachers ? `${T.teachers[locale]}: ${group.teachers}` : '',
          group.placesFree > 0 ? `${T.free[locale]}: ${group.placesFree}` : '',
        ].filter(Boolean),
      }));

  return (
    <div className="kunbagys-home">
      <section className="kunbagys-hero">
        <ThemeImage theme={THEME} name="hero" className="kunbagys-hero-photo" sizes="100vw" eager />
        <div className="container-page kunbagys-hero-inner">
          <div className="kunbagys-hero-bar">
            <HeroTitle hero={hero} tone="light" withEyebrow={false} className="kunbagys-h1" />
            {hero.buttons.length > 0 ? (
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <HeroButtons hero={hero} tone="light" />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="container-page kunbagys-welcome" aria-labelledby="kunbagys-welcome">
        <Heading mark={T.welcomeMark[locale]} title={T.welcome[locale]} id="kunbagys-welcome" />
        <div className="kunbagys-welcome-grid">
          <div className="kunbagys-photos">
            <ThemeImage theme={THEME} name="table" sizes="(min-width: 1024px) 30vw, 90vw" />
            <CoverOr coverUrl={coverUrl} coverPosition={coverPosition} theme={THEME} name="yard" />
          </div>
          <div>
            {aboutText ? <p className="kunbagys-intro">{aboutText}</p> : null}
            {why.length > 0 ? (
              <>
                <p className="mt-6 font-extrabold">{T.why[locale]}</p>
                <ul className="kunbagys-why">
                  {why.map((line) => <li key={line}>{line}</li>)}
                </ul>
              </>
            ) : null}
            {hero.lead && hero.lead !== aboutText ? <p className="kunbagys-text mt-5">{hero.lead}</p> : null}
            <EnrollLink menu={menu} locale={locale} className="kunbagys-btn mt-7" />
          </div>
        </div>
      </section>

      <section className="kunbagys-programs-wrap" aria-labelledby="kunbagys-programs">
        <div className="container-page py-14">
          <Heading mark={T.programsMark[locale]} title={T.programs[locale]} id="kunbagys-programs" />
          <ul className="kunbagys-programs">
            {programs.map((program, index) => (
              <li key={program.key}>
                <ThemeImage theme={THEME} name={TOYS[index % 4]} className="kunbagys-toy" sizes="6rem" />
                <b>{program.title}</b>
                {program.text ? <span>{program.text}</span> : null}
                {programsHref ? <SiteLink href={programsHref} locale={locale} className="kunbagys-btn kunbagys-btn-sm">{T.more[locale]}</SiteLink> : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {tabs.length > 0 ? (
        <section className="container-page py-14" aria-labelledby="kunbagys-prices">
          <Heading mark={prices.length > 0 ? T.pricesMark[locale] : T.groupsMark[locale]} title={prices.length > 0 ? T.prices[locale] : T.groups[locale]} id="kunbagys-prices" />
          {/* Вкладки без скриптов: радиокнопки и CSS, работают и с клавиатуры. */}
          <div className={`kunbagys-tabs kunbagys-tabs-${tabs.length}`}>
            {tabs.map((tab, index) => (
              <input key={tab.key} type="radio" name="kunbagys-tab" id={`kunbagys-tab-${index}`} defaultChecked={index === 0} className="sr-only" />
            ))}
            <div className="kunbagys-tab-labels">
              {tabs.map((tab, index) => <label key={tab.key} htmlFor={`kunbagys-tab-${index}`}>{tab.title}</label>)}
            </div>
            <div className="kunbagys-tab-panels">
              {tabs.map((tab) => (
                <div key={tab.key}>
                  <p className="font-bold">{tab.title}</p>
                  {tab.price ? <p className="kunbagys-price">{tab.price}</p> : null}
                  {tab.lines.length > 0 ? <ul>{tab.lines.map((line) => <li key={line}>{line}</li>)}</ul> : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {reviews.length > 0 ? (
        <section className="container-page py-14" aria-labelledby="kunbagys-reviews">
          <Heading mark={T.reviewsMark[locale]} title={T.reviews[locale]} id="kunbagys-reviews" />
          <ul className="kunbagys-reviews">
            {reviews.slice(0, 3).map((review) => (
              <li key={review.id}>
                <blockquote>{pick(locale, review.textKk, review.textRu)}</blockquote>
                {review.rating ? <Stars rating={review.rating} locale={locale} /> : null}
                <b>{review.authorName}</b>
                {pick(locale, review.authorNoteKk, review.authorNoteRu) ? <span className="text-sm">{pick(locale, review.authorNoteKk, review.authorNoteRu)}</span> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {news.length > 0 ? (
        <section className="container-page py-14" aria-labelledby="kunbagys-news">
          <Heading mark={T.newsMark[locale]} title={BLOCK_T.news[locale]} id="kunbagys-news" />
          <div className="kunbagys-news mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.slice(0, 3).map((post) => <NewsCard key={post.id} post={post} locale={locale} />)}
          </div>
          <p className="mt-8 text-center"><SiteLink href="/news" locale={locale} className="kunbagys-btn">{BLOCK_T.allNews[locale]}</SiteLink></p>
        </section>
      ) : null}
    </div>
  );
}
