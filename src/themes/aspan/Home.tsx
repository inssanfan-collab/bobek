import { NewsCard, SiteLink, T as BLOCK_T } from '@/components/site/blocks';
import { HeroButtons, HeroTitle } from '@/components/site/Hero';
import { StatsRow } from '@/components/site/home-blocks';
import { ReviewList } from '@/components/site/sections';
import { CoverOr, EnrollLink, SectionHead, ThemeImage, aboutSection, developmentAreas } from '@/components/site/theme-kit';
import { homeStats } from '@/lib/home-stats';
import { pick } from '@/lib/i18n';
import { formatAgeRange } from '@/lib/labels';
import type { HomeProps } from '@/templates/types';
import { Cloud, SunFace } from './Doodles';

const THEME = 'aspan';

const T = {
  more: { kk: 'Толығырақ', ru: 'Подробнее' },
  welcome: { kk: 'Балалық шақтың ең бақытты әлеміне қош келдіңіздер!', ru: 'Добро пожаловать в самый счастливый мир детства!' },
  games: { kk: 'Балалардың қабілетін дамытатын сабақтар', ru: 'Занятия, которые развивают способности' },
  groups: { kk: 'Баланың жасына сай топтар', ru: 'Группы по возрасту ребёнка' },
  free: { kk: 'бос орын', ru: 'свободно' },
  reviews: { kk: 'Ата-аналардың пікірлері', ru: 'Отзывы родителей' },
} as const;

const CIRCLE_IMAGES = ['art', 'blocks', 'walk'];

/**
 * Главная «Аспан» — небо и солнце (структура дизайна №3): голубой первый
 * экран с круглым фото, три «подвешенные» карточки, приветствие с коллажем
 * из кругов, занятия в круглых фото, группы вокруг центрального фото,
 * новости, отзывы, облака над подвалом.
 */
export function AspanHome({ profile, news, locale, coverUrl, coverPosition, hero, menu, clubs = [], groups = [], reviews = [], counts }: HomeProps) {
  const stats = homeStats(profile, counts, locale);
  const about = aboutSection(menu);
  const aboutText = pick(locale, profile?.aboutKk, profile?.aboutRu);
  const areas = developmentAreas(locale);
  const hanging = areas.filter((area) => ['speech', 'logic', 'health'].includes(area.key));
  const lessons = clubs.length > 0
    ? clubs.slice(0, 3).map((club, index) => ({ key: club.id, title: pick(locale, club.nameKk, club.nameRu), text: pick(locale, club.descKk, club.descRu), image: CIRCLE_IMAGES[index % 3] }))
    : areas.filter((area) => ['art', 'logic', 'health'].includes(area.key)).map((area, index) => ({ ...area, image: CIRCLE_IMAGES[index % 3] }));
  const leftGroups = groups.slice(0, 6).filter((_, index) => index % 2 === 0);
  const rightGroups = groups.slice(0, 6).filter((_, index) => index % 2 === 1);

  const groupItem = (group: (typeof groups)[number]) => (
    <li key={group.id} className="aspan-group">
      <b>{pick(locale, group.nameKk, group.nameRu)}</b>
      <span>
        {group.ageFrom != null || group.ageTo != null ? formatAgeRange(group.ageFrom, group.ageTo, locale) : null}
        {group.placesFree > 0 ? ` · ${group.placesFree} ${T.free[locale]}` : null}
      </span>
    </li>
  );

  return (
    <div className="aspan-home">
      <section className="aspan-hero">
        <Cloud className="aspan-doodle aspan-cloud-1" />
        <Cloud className="aspan-doodle aspan-cloud-2" />
        <div className="container-page relative grid items-center gap-10 pb-10 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:pt-16">
          <div>
            {hero.eyebrow ? <p className="aspan-pill">{hero.eyebrow}</p> : null}
            <HeroTitle hero={hero} tone="plain" withEyebrow={false} className="aspan-h1 font-display" />
            {hero.lead ? <p className="aspan-lead">{hero.lead}</p> : null}
            <div className="mt-7 flex flex-wrap gap-3">
              <HeroButtons hero={hero} tone="plain">
                <EnrollLink menu={menu} locale={locale} className="btn-primary" />
                {about ? <SiteLink href={`/${about.slug}`} locale={locale} className="btn-secondary">{T.more[locale]}</SiteLink> : null}
              </HeroButtons>
            </div>
            <StatsRow stats={stats} className="aspan-stats" />
          </div>
          <div className="aspan-circle-wrap">
            <SunFace className="aspan-doodle aspan-sun" />
            <CoverOr coverUrl={coverUrl} coverPosition={coverPosition} theme={THEME} name="hero" className="aspan-circle" eager />
          </div>
        </div>
        <div className="container-page relative pb-16">
          <ul className="aspan-hanging grid gap-6 md:grid-cols-3">
            {hanging.map((area) => (
              <li key={area.key} className="aspan-hang-card">
                <h3>{area.title}</h3>
                <p>{area.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="aspan-section" aria-labelledby="aspan-welcome">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2">
          <div className="aspan-circles" aria-hidden>
            <ThemeImage theme={THEME} name="walk" sizes="(min-width: 1024px) 25vw, 50vw" />
            <ThemeImage theme={THEME} name="blocks" sizes="(min-width: 1024px) 25vw, 50vw" />
            <ThemeImage theme={THEME} name="art" sizes="(min-width: 1024px) 25vw, 50vw" />
          </div>
          <div>
            <SectionHead id="aspan-welcome" title={T.welcome[locale]} />
            {aboutText && aboutText !== hero.lead ? <p className="aspan-text mt-4">{aboutText}</p> : null}
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {areas.slice(0, 4).map((area) => (
                <li key={area.key} className="aspan-feature">
                  <b>{area.title}</b>
                  <span>{area.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="aspan-section aspan-cream" aria-labelledby="aspan-lessons">
        <div className="container-page">
          <SectionHead id="aspan-lessons" title={T.games[locale]} className="kit-head text-center" />
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {lessons.map((lesson) => (
              <li key={lesson.key} className="aspan-lesson">
                <ThemeImage theme={THEME} name={lesson.image} className="aspan-lesson-photo" sizes="(min-width: 768px) 20vw, 50vw" />
                <h3>{lesson.title}</h3>
                {lesson.text ? <p>{lesson.text}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {groups.length > 0 ? (
        <section className="aspan-section" aria-labelledby="aspan-groups">
          <div className="container-page">
            <SectionHead id="aspan-groups" title={T.groups[locale]} className="kit-head text-center" />
            <div className="mt-10 grid items-center gap-8 lg:grid-cols-[1fr_auto_1fr]">
              <ul className="space-y-4 lg:text-right">{leftGroups.map(groupItem)}</ul>
              <ThemeImage theme={THEME} name="blocks" className="aspan-center-photo" sizes="(min-width: 1024px) 30vw, 100vw" />
              <ul className="space-y-4">{rightGroups.map(groupItem)}</ul>
            </div>
          </div>
        </section>
      ) : null}

      {news.length > 0 ? (
        <section className="aspan-section aspan-cream" aria-labelledby="aspan-news">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <SectionHead id="aspan-news" title={BLOCK_T.news[locale]} />
              <SiteLink href="/news" locale={locale} className="aspan-more">{BLOCK_T.allNews[locale]} →</SiteLink>
            </div>
            <div className="aspan-news mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news.slice(0, 3).map((post) => <NewsCard key={post.id} post={post} locale={locale} />)}
            </div>
          </div>
        </section>
      ) : null}

      {reviews.length > 0 ? (
        <section className="aspan-section" aria-labelledby="aspan-reviews">
          <div className="container-page">
            <SectionHead id="aspan-reviews" title={T.reviews[locale]} className="kit-head text-center" />
            <ReviewList reviews={reviews.slice(0, 3)} locale={locale} className="aspan-reviews mt-10 grid gap-6 md:grid-cols-3" />
          </div>
        </section>
      ) : null}
    </div>
  );
}
