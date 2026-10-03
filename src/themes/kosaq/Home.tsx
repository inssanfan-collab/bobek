import { NewsCard, SiteLink, T as BLOCK_T } from '@/components/site/blocks';
import { HeroButtons, HeroTitle } from '@/components/site/Hero';
import { EnrollLink, ThemeImage, developmentAreas, findSection } from '@/components/site/theme-kit';
import { homeStats } from '@/lib/home-stats';
import { pick } from '@/lib/i18n';
import { formatAgeRange } from '@/lib/labels';
import type { HomeProps } from '@/templates/types';
import { Check, Cloud, CloudBadge, Icon, Plane, Rainbow, ScallopDefs, Squiggle, Sun, SunFace } from './Doodles';

const THEME = 'kosaq';

const T = {
  aboutEyebrow: { kk: 'Біздің балабақшаға қош келдіңіз', ru: 'Добро пожаловать в наш детский сад' },
  aboutTitle: { kk: 'Балаға арналған жылы әрі қауіпсіз орта', ru: 'Тёплая и безопасная среда для ребёнка' },
  address: { kk: 'Мекенжайымыз', ru: 'Наш адрес' },
  hours: { kk: 'Жұмыс уақыты', ru: 'Время работы' },
  enroll: { kk: 'Бақшаға жазылыңыз', ru: 'Записаться в сад' },
  langKk: { kk: 'Қазақ тілінде оқыту', ru: 'Обучение на казахском' },
  langRu: { kk: 'Орыс тілінде оқыту', ru: 'Обучение на русском' },
  places: { kk: 'орын', ru: 'мест' },
  groupsCount: { kk: 'топ', ru: 'групп' },
  stepsEyebrow: { kk: 'Біздің бағыттар', ru: 'Наши направления' },
  steps: { kk: 'Шабытқа толы кішкентай қадамдар', ru: 'Маленькие шаги, полные вдохновения' },
  groupsEyebrow: { kk: 'Жас топтары', ru: 'Возрастные группы' },
  groups: { kk: 'Әр баланың жас ерекшелігіне сай даму ортасы', ru: 'Среда развития по возрасту каждого ребёнка' },
  language: { kk: 'Оқыту тілі', ru: 'Язык обучения' },
  kk: { kk: 'қазақ', ru: 'казахский' },
  ru: { kk: 'орыс', ru: 'русский' },
  teachers: { kk: 'Тәрбиешілер', ru: 'Воспитатели' },
  free: { kk: 'Бос орын', ru: 'Свободных мест' },
  newsEyebrow: { kk: 'Ақпарат әлемі', ru: 'Мир новостей' },
  news: { kk: 'Кішкентай жұлдыздарымыздың жаңалықтары', ru: 'Новости наших маленьких звёзд' },
  band: { kk: 'Бақшамыздағы іс-шаралар мен жаңалықтардан хабардар болыңыз!', ru: 'Будьте в курсе событий и новостей нашего сада!' },
} as const;

const STAT_TONES = ['kosaq-green', 'kosaq-orange', 'kosaq-purple'];
const STAT_ICONS = ['child', 'teacher', 'event'];
const STEP_ICONS = ['binoculars', 'palette', 'star', 'music', 'abacus', 'heart'];
const STEP_COLORS = ['#16A34A', '#DB2777', '#7C3AED', '#DB2777', '#7C3AED', '#EA580C'];
const GROUP_TONES = ['kosaq-bar-purple', 'kosaq-bar-orange', 'kosaq-bar-teal'];

/**
 * Главная «Қосақ» — вплотную к образцу №5: светлое небо с облаками,
 * солнцем и радугой, по краям два фото в рамке-«ромашке», заголовок
 * по центру и три цветных счётчика; «О нас» с двумя фото в цветных
 * рамках; шесть направлений со значками в облачках; группы цветным
 * аккордеоном рядом с фото в «ромашке»; новости с облачным краем;
 * персиковая полоса с детьми-вырезками; синий подвал.
 */
export function KosaqHome({ profile, news, locale, hero, menu, clubs = [], groups = [], counts }: HomeProps) {
  const stats = homeStats(profile, counts, locale).slice(0, 3);
  const groupsSection = findSection(menu, 'GROUPS');
  const aboutText = pick(locale, profile?.aboutKk, profile?.aboutRu);
  const address = pick(locale, profile?.addressKk, profile?.addressRu);
  const steps = clubs.length > 0
    ? clubs.slice(0, 6).map((club) => ({ key: club.id, title: pick(locale, club.nameKk, club.nameRu), text: pick(locale, club.descKk, club.descRu) }))
    : developmentAreas(locale);
  const checks = [
    profile?.langKk ? T.langKk[locale] : null,
    profile?.langRu ? T.langRu[locale] : null,
    profile?.placesTotal ? `${profile.placesTotal} ${T.places[locale]}` : null,
  ].filter((item): item is string => Boolean(item));

  return (
    <div className="kosaq-home">
      <ScallopDefs />
      <section className="kosaq-hero">
        <Cloud className="kosaq-cloud kosaq-cloud-1" />
        <Cloud className="kosaq-cloud kosaq-cloud-2" />
        <Cloud className="kosaq-cloud kosaq-cloud-3" />
        <Sun className="kosaq-hero-sun" />
        <Rainbow className="kosaq-rainbow" />
        <Plane className="kosaq-hero-plane" />
        <div className="container-page kosaq-hero-grid">
          <span className="kosaq-scallop kosaq-hero-photo kosaq-hero-left"><ThemeImage theme={THEME} name="left" sizes="(min-width: 1024px) 24vw, 60vw" eager /></span>
          <div className="kosaq-hero-text">
            <HeroTitle hero={hero} tone="plain" withEyebrow={false} className="kosaq-h1" />
            {hero.lead ? <p className="kosaq-lead">{hero.lead}</p> : null}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <HeroButtons hero={hero} tone="plain">
                <EnrollLink menu={menu} locale={locale} className="kosaq-green-btn" />
              </HeroButtons>
            </div>
            {stats.length > 0 ? (
              <ul className="kosaq-stats">
                {stats.map((stat, index) => (
                  <li key={stat.label} className={STAT_TONES[index % 3]}>
                    <span className="kosaq-stat-icon"><Icon name={STAT_ICONS[index % 3]} className="h-7 w-7" /></span>
                    <b>{stat.value}</b>
                    <span>{stat.label}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <span className="kosaq-scallop kosaq-hero-photo kosaq-hero-right"><ThemeImage theme={THEME} name="right" sizes="(min-width: 1024px) 24vw, 60vw" eager /></span>
        </div>
      </section>

      <section className="container-page kosaq-about" aria-labelledby="kosaq-about">
        <div className="kosaq-frames" aria-hidden>
          <ThemeImage theme={THEME} name="read" className="kosaq-frame kosaq-frame-1" sizes="(min-width: 1024px) 26vw, 70vw" />
          <ThemeImage theme={THEME} name="dress" className="kosaq-frame kosaq-frame-2" sizes="(min-width: 1024px) 20vw, 55vw" />
          <SunFace className="kosaq-frames-sun" />
        </div>
        <div>
          <p className="kosaq-eyebrow">{T.aboutEyebrow[locale]}</p>
          <h2 id="kosaq-about" className="kosaq-title">{T.aboutTitle[locale]}</h2>
          <Squiggle className="kosaq-squiggle" />
          {aboutText ? <p className="kosaq-text mt-4">{aboutText}</p> : null}
          {address || profile?.workHours ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {address ? <div><b className="kosaq-sub">{T.address[locale]}</b><p className="kosaq-text mt-2 text-sm">{address}</p></div> : null}
              {profile?.workHours ? <div><b className="kosaq-sub">{T.hours[locale]}</b><p className="kosaq-text mt-2 text-sm">{profile.workHours}</p></div> : null}
            </div>
          ) : null}
          {checks.length > 0 ? (
            <ul className="mt-5 space-y-2">
              {checks.map((check) => <li key={check} className="flex items-center gap-2 text-sm font-bold"><Check />{check}</li>)}
            </ul>
          ) : null}
          <EnrollLink menu={menu} locale={locale} className="kosaq-green-btn mt-7">{T.enroll[locale]} <Icon name="arrow" className="h-4 w-4" /></EnrollLink>
        </div>
      </section>

      <section className="container-page kosaq-steps" aria-labelledby="kosaq-steps">
        <p className="kosaq-eyebrow kosaq-eyebrow-green text-center">{T.stepsEyebrow[locale]}</p>
        <h2 id="kosaq-steps" className="kosaq-title kosaq-red text-center">{T.steps[locale]}</h2>
        <Squiggle className="kosaq-squiggle mx-auto" />
        <ul className="kosaq-step-grid">
          {steps.map((step, index) => (
            <li key={step.key} className="kosaq-step">
              <CloudBadge name={STEP_ICONS[index % 6]} color={STEP_COLORS[index % 6]} />
              <span>
                <b>{step.title}</b>
                {step.text ? <span>{step.text}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {groups.length > 0 ? (
        <section className="container-page kosaq-groups" aria-labelledby="kosaq-groups">
          <div>
            <p className="kosaq-eyebrow">{T.groupsEyebrow[locale]}</p>
            <h2 id="kosaq-groups" className="kosaq-title">{T.groups[locale]}</h2>
            <Squiggle className="kosaq-squiggle" />
            <div className="kosaq-accordion">
              {groups.slice(0, 6).map((group, index) => {
                const age = formatAgeRange(group.ageFrom, group.ageTo, locale);
                return (
                  // <details>: работает без скриптов; первая группа открыта, как в образце.
                  <details key={group.id} open={index === 0} className={GROUP_TONES[index % 3]}>
                    <summary>
                      <span>{pick(locale, group.nameKk, group.nameRu)}{age ? ` (${age})` : ''}</span>
                      <Icon name="chevron" className="kosaq-chevron h-4 w-4" />
                    </summary>
                    <ul>
                      <li>{T.language[locale]}: {group.language === 'ru' ? T.ru[locale] : T.kk[locale]}</li>
                      {group.teachers ? <li>{T.teachers[locale]}: {group.teachers}</li> : null}
                      {group.placesFree > 0 ? <li>{T.free[locale]}: {group.placesFree}</li> : null}
                    </ul>
                  </details>
                );
              })}
            </div>
            {groupsSection ? <SiteLink href={`/${groupsSection.slug}`} locale={locale} className="kosaq-more mt-6 inline-block">{pick(locale, groupsSection.titleKk, groupsSection.titleRu)} →</SiteLink> : null}
          </div>
          <div className="kosaq-groups-art">
            <SunFace className="kosaq-groups-sun" />
            <span className="kosaq-scallop kosaq-groups-photo"><ThemeImage theme={THEME} name="group" sizes="(min-width: 1024px) 34vw, 85vw" /></span>
          </div>
        </section>
      ) : null}

      {news.length > 0 ? (
        <section className="container-page kosaq-news-wrap" aria-labelledby="kosaq-news">
          <p className="kosaq-eyebrow kosaq-eyebrow-green text-center">{T.newsEyebrow[locale]}</p>
          <h2 id="kosaq-news" className="kosaq-title kosaq-red text-center">{T.news[locale]}</h2>
          <Squiggle className="kosaq-squiggle mx-auto" />
          <div className="kosaq-news mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.slice(0, 3).map((post) => <NewsCard key={post.id} post={post} locale={locale} />)}
          </div>
        </section>
      ) : null}

      <section className="kosaq-band" aria-labelledby="kosaq-band">
        <ThemeImage theme={THEME} name="band-left" className="kosaq-band-left decor" sizes="(min-width: 1024px) 24vw, 40vw" />
        <div className="container-page kosaq-band-text">
          <h2 id="kosaq-band" className="kosaq-band-title">{T.band[locale]}</h2>
          {news.length > 0 ? (
            <SiteLink href="/news" locale={locale} className="kosaq-green-btn mt-6">{BLOCK_T.allNews[locale]} <Icon name="arrow" className="h-4 w-4" /></SiteLink>
          ) : (
            <EnrollLink menu={menu} locale={locale} className="kosaq-green-btn mt-6" />
          )}
        </div>
        <ThemeImage theme={THEME} name="band-right" className="kosaq-band-right decor" sizes="(min-width: 1024px) 18vw, 32vw" />
      </section>
    </div>
  );
}
