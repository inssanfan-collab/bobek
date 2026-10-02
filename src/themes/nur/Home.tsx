import { ContactCard, NewsCard, SiteLink, T as BLOCK_T } from '@/components/site/blocks';
import { HeroButtons, HeroTitle } from '@/components/site/Hero';
import { StaffCards, StatsRow } from '@/components/site/home-blocks';
import { RouteMap } from '@/components/site/RouteMap';
import { ReviewList } from '@/components/site/sections';
import { CoverOr, EnrollLink, SectionHead, ThemeImage, aboutSection, developmentAreas, findSection } from '@/components/site/theme-kit';
import { homeStats } from '@/lib/home-stats';
import { pick } from '@/lib/i18n';
import { formatAgeRange } from '@/lib/labels';
import type { HomeProps } from '@/templates/types';

const THEME = 'nur';

const T = {
  more: { kk: 'Толығырақ', ru: 'Подробнее' },
  welcomeEyebrow: { kk: 'Талант пен даму', ru: 'Таланты и развитие' },
  welcome: { kk: 'Балабақшамызға қош келдіңіз', ru: 'Добро пожаловать в наш сад' },
  programs: { kk: 'Біздің бағдарламалар', ru: 'Наши программы' },
  staff: { kk: 'Біздің мамандар', ru: 'Наши специалисты' },
  allStaff: { kk: 'Барлық педагогтар', ru: 'Все педагоги' },
  reviews: { kk: 'Ата-аналар пікірлері', ru: 'Отзывы родителей' },
  ctaTitle: { kk: 'Экскурсияға келіңіз', ru: 'Приходите на экскурсию' },
  ctaLead: { kk: 'Балабақшаны өз көзіңізбен көріп, тәрбиешілермен танысыңыз.', ru: 'Посмотрите сад своими глазами и познакомьтесь с воспитателями.' },
  hours: { kk: 'Жұмыс уақыты', ru: 'Часы работы' },
  langs: { kk: 'Қазақ және орыс тілдерінде', ru: 'На казахском и русском' },
} as const;

const PROGRAM_IMAGES = ['paint', 'sport', 'music'];

/**
 * Главная «Нұр» — тёплая, с рукописными заголовками (структура дизайна №7):
 * карточка-первый экран с фото, приветствие со счётчиками, три программы,
 * специалисты, новости, отзывы, приглашение и контакты с картой.
 */
export function NurHome({ profile, news, locale, coverUrl, coverPosition, hero, menu, clubs = [], staff = [], reviews = [], groups = [], counts }: HomeProps) {
  const stats = homeStats(profile, counts, locale);
  const about = aboutSection(menu);
  const staffSection = findSection(menu, 'STAFF');
  const aboutText = pick(locale, profile?.aboutKk, profile?.aboutRu);
  const ages = groups.flatMap((group) => [group.ageFrom, group.ageTo]).filter((age): age is number => age != null);
  const chips = [
    ages.length > 0 ? formatAgeRange(Math.min(...ages), Math.max(...ages), locale) : null,
    profile?.langKk && profile?.langRu ? T.langs[locale] : null,
    profile?.workHours ? `${T.hours[locale]}: ${profile.workHours}` : null,
  ].filter((chip): chip is string => Boolean(chip));
  const programs = clubs.length > 0
    ? clubs.slice(0, 3).map((club, index) => ({ key: club.id, title: pick(locale, club.nameKk, club.nameRu), text: pick(locale, club.descKk, club.descRu), image: PROGRAM_IMAGES[index % 3] }))
    : developmentAreas(locale).filter((area) => ['art', 'health', 'speech'].includes(area.key)).map((area, index) => ({ ...area, image: PROGRAM_IMAGES[index % 3] }));

  return (
    <div className="nur-home">
      <section className="container-page pt-6 lg:pt-10">
        <div className="nur-hero">
          <div>
            {hero.eyebrow ? <p className="nur-pill">{hero.eyebrow}</p> : null}
            <HeroTitle hero={hero} tone="plain" withEyebrow={false} className="nur-h1" />
            {hero.lead ? <p className="nur-lead">{hero.lead}</p> : null}
            <div className="mt-7 flex flex-wrap gap-3">
              <HeroButtons hero={hero} tone="plain">
                <EnrollLink menu={menu} locale={locale} className="btn-primary" />
                {about ? <SiteLink href={`/${about.slug}`} locale={locale} className="btn-secondary">{T.more[locale]}</SiteLink> : null}
              </HeroButtons>
            </div>
            {chips.length > 0 ? (
              <ul className="mt-7 flex flex-wrap gap-2">
                {chips.map((chip) => <li key={chip} className="nur-chip">{chip}</li>)}
              </ul>
            ) : null}
          </div>
          <div className="nur-photo-wrap">
            <CoverOr coverUrl={coverUrl} coverPosition={coverPosition} theme={THEME} name="hero" className="nur-photo" eager />
          </div>
        </div>
      </section>

      <section className="nur-section" aria-labelledby="nur-welcome">
        <div className="container-page grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="nur-frame">
            <ThemeImage theme={THEME} name="paint" />
          </div>
          <div>
            <SectionHead id="nur-welcome" eyebrow={T.welcomeEyebrow[locale]} title={T.welcome[locale]} />
            {aboutText && aboutText !== hero.lead ? <p className="nur-text mt-4">{aboutText}</p> : null}
            <StatsRow stats={stats} className="nur-stats" />
          </div>
        </div>
      </section>

      <section className="nur-section nur-tint" aria-labelledby="nur-programs">
        <div className="container-page">
          <SectionHead id="nur-programs" title={T.programs[locale]} className="kit-head text-center" />
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {programs.map((program) => (
              <li key={program.key} className="nur-program">
                <ThemeImage theme={THEME} name={program.image} className="nur-program-photo" sizes="(min-width: 768px) 33vw, 100vw" />
                <div className="p-6">
                  <h3>{program.title}</h3>
                  {program.text ? <p>{program.text}</p> : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {staff.length > 0 ? (
        <section className="nur-section" aria-labelledby="nur-staff">
          <div className="container-page">
            <SectionHead id="nur-staff" title={T.staff[locale]} className="kit-head text-center" />
            <StaffCards staff={staff} locale={locale} limit={4} className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" />
            {staffSection && staff.length > 4 ? (
              <p className="mt-8 text-center"><SiteLink href={`/${staffSection.slug}`} locale={locale} className="btn-secondary">{T.allStaff[locale]}</SiteLink></p>
            ) : null}
          </div>
        </section>
      ) : null}

      {news.length > 0 ? (
        <section className="nur-section nur-tint" aria-labelledby="nur-news">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <SectionHead id="nur-news" title={BLOCK_T.news[locale]} />
              <SiteLink href="/news" locale={locale} className="nur-more">{BLOCK_T.allNews[locale]} →</SiteLink>
            </div>
            <div className="nur-news mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news.slice(0, 3).map((post) => <NewsCard key={post.id} post={post} locale={locale} />)}
            </div>
          </div>
        </section>
      ) : null}

      {reviews.length > 0 ? (
        <section className="nur-section" aria-labelledby="nur-reviews">
          <div className="container-page">
            <SectionHead id="nur-reviews" title={T.reviews[locale]} className="kit-head text-center" />
            <ReviewList reviews={reviews.slice(0, 3)} locale={locale} className="nur-reviews mt-10 grid gap-6 md:grid-cols-3" />
          </div>
        </section>
      ) : null}

      <section className="nur-section nur-tint" aria-labelledby="nur-cta">
        <div className="container-page grid items-start gap-6 lg:grid-cols-2">
          <div className="nur-cta-card">
            <h2 id="nur-cta">{T.ctaTitle[locale]}</h2>
            <p>{T.ctaLead[locale]}</p>
            <ThemeImage theme={THEME} name="walk" className="nur-cta-photo" sizes="(min-width: 1024px) 40vw, 100vw" />
            <EnrollLink menu={menu} locale={locale} className="btn-primary mt-6 inline-flex" />
          </div>
          {profile ? (
            <div className="space-y-6">
              <div className="nur-contact"><ContactCard profile={profile} locale={locale} /></div>
              <div className="nur-map">
                <RouteMap lat={profile.lat} lng={profile.lng} address={pick(locale, profile.addressKk, profile.addressRu)} locale={locale} />
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
