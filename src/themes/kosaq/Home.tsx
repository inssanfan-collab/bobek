import { NewsCard, SiteLink, T as BLOCK_T } from '@/components/site/blocks';
import { HeroButtons, HeroTitle } from '@/components/site/Hero';
import { StatsRow } from '@/components/site/home-blocks';
import { CoverOr, EnrollLink, SectionHead, ThemeImage, aboutSection, developmentAreas, findSection } from '@/components/site/theme-kit';
import { homeStats } from '@/lib/home-stats';
import { pick } from '@/lib/i18n';
import { formatAgeRange } from '@/lib/labels';
import type { HomeProps } from '@/templates/types';
import { Rainbow } from './Doodles';

const THEME = 'kosaq';

const T = {
  about: { kk: 'Біз туралы', ru: 'О нас' },
  aboutTitle: { kk: 'Үздік мектепке дейінгі орта', ru: 'Лучшая дошкольная среда' },
  more: { kk: 'Толығырақ', ru: 'Подробнее' },
  steps: { kk: 'Шығармашылыққа толы күнделікті қадамдар', ru: 'Каждый день — с творчеством' },
  groups: { kk: 'Әр баланың жасына сай даму ортасы', ru: 'Среда развития по возрасту ребёнка' },
  teachers: { kk: 'Тәрбиешілер', ru: 'Воспитатели' },
  places: { kk: 'Бос орын', ru: 'Свободно мест' },
  language: { kk: 'Оқыту тілі', ru: 'Язык обучения' },
  kk: { kk: 'қазақ', ru: 'казахский' },
  ru: { kk: 'орыс', ru: 'русский' },
  follow: { kk: 'Іс-шаралардан хабардар болыңыз', ru: 'Следите за событиями сада' },
  followLead: { kk: 'Мерекелер, сабақтар мен күнделікті сәттер — біздің парақшада.', ru: 'Праздники, занятия и будни сада — на нашей странице.' },
  instagram: { kk: 'Instagram-ға өту', ru: 'Перейти в Instagram' },
  allGroups: { kk: 'Барлық топтар', ru: 'Все группы' },
} as const;

/**
 * Главная «Кемпірқосақ» — радуга (структура дизайна №5): коллаж из трёх
 * фото на радужной дуге, «О нас» в две колонки, сетка занятий со значками,
 * группы раскрывашками с круглым фото, новости, фиолетовая полоса
 * со ссылкой на Instagram сада.
 */
export function KosaqHome({ profile, news, locale, coverUrl, coverPosition, hero, menu, clubs = [], groups = [], counts }: HomeProps) {
  const stats = homeStats(profile, counts, locale);
  const about = aboutSection(menu);
  const groupsSection = findSection(menu, 'GROUPS');
  const aboutText = pick(locale, profile?.aboutKk, profile?.aboutRu);
  const areas = developmentAreas(locale);
  const steps = clubs.length >= 3
    ? clubs.slice(0, 9).map((club) => ({ key: club.id, title: pick(locale, club.nameKk, club.nameRu), text: pick(locale, club.descKk, club.descRu) }))
    : areas;
  const half = Math.ceil(areas.length / 2);

  return (
    <div className="kosaq-home">
      <section className="kosaq-hero">
        <div className="container-page grid items-center gap-10 py-12 lg:grid-cols-2 lg:py-16">
          <div>
            {hero.eyebrow ? <p className="kosaq-pill">{hero.eyebrow}</p> : null}
            <HeroTitle hero={hero} tone="plain" withEyebrow={false} className="kosaq-h1 font-display" />
            {hero.lead ? <p className="kosaq-lead">{hero.lead}</p> : null}
            <div className="mt-7 flex flex-wrap gap-3">
              <HeroButtons hero={hero} tone="plain">
                <EnrollLink menu={menu} locale={locale} className="btn-primary" />
                {about ? <SiteLink href={`/${about.slug}`} locale={locale} className="btn-secondary">{T.more[locale]}</SiteLink> : null}
              </HeroButtons>
            </div>
            <StatsRow stats={stats} className="kosaq-stats" />
          </div>
          <div className="kosaq-collage">
            <Rainbow className="kosaq-rainbow" />
            <CoverOr coverUrl={coverUrl} coverPosition={coverPosition} theme={THEME} name="hero" className="kosaq-main" eager />
            <ThemeImage theme={THEME} name="art" className="kosaq-small kosaq-small-1" sizes="(min-width: 1024px) 15vw, 35vw" />
            <ThemeImage theme={THEME} name="walk" className="kosaq-small kosaq-small-2" sizes="(min-width: 1024px) 15vw, 35vw" />
          </div>
        </div>
      </section>

      <section className="kosaq-section" aria-labelledby="kosaq-about">
        <div className="container-page grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="kosaq-stack">
            <ThemeImage theme={THEME} name="sport" sizes="(min-width: 1024px) 30vw, 100vw" />
            <ThemeImage theme={THEME} name="art" sizes="(min-width: 1024px) 30vw, 100vw" />
          </div>
          <div>
            <SectionHead id="kosaq-about" eyebrow={T.about[locale]} title={T.aboutTitle[locale]} />
            {aboutText && aboutText !== hero.lead ? <p className="kosaq-text mt-4">{aboutText}</p> : null}
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {[areas.slice(0, half), areas.slice(half)].map((column, index) => (
                <ul key={index} className="space-y-3">
                  {column.map((area) => (
                    <li key={area.key} className="kosaq-bullet"><b>{area.title}</b> — {area.text}</li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="kosaq-section kosaq-soft" aria-labelledby="kosaq-steps">
        <div className="container-page">
          <SectionHead id="kosaq-steps" title={T.steps[locale]} className="kit-head text-center" />
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.key} className={`kosaq-step kosaq-step-${index % 6}`}>
                <span className="kosaq-step-icon" aria-hidden>{index + 1}</span>
                <span>
                  <b>{step.title}</b>
                  {step.text ? <span className="block">{step.text}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {groups.length > 0 ? (
        <section className="kosaq-section" aria-labelledby="kosaq-groups">
          <div className="container-page grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <SectionHead id="kosaq-groups" title={T.groups[locale]} />
              <div className="mt-6 space-y-3">
                {groups.slice(0, 6).map((group, index) => (
                  // <details> — раскрывается без скрипта и с клавиатуры.
                  <details key={group.id} className="kosaq-group" open={index === 0}>
                    <summary>
                      <b>{pick(locale, group.nameKk, group.nameRu)}</b>
                      {group.ageFrom != null || group.ageTo != null ? <span>{formatAgeRange(group.ageFrom, group.ageTo, locale)}</span> : null}
                    </summary>
                    <dl>
                      <div><dt>{T.language[locale]}</dt><dd>{group.language === 'ru' ? T.ru[locale] : T.kk[locale]}</dd></div>
                      {group.teachers ? <div><dt>{T.teachers[locale]}</dt><dd>{group.teachers}</dd></div> : null}
                      {group.placesFree > 0 ? <div><dt>{T.places[locale]}</dt><dd>{group.placesFree}</dd></div> : null}
                    </dl>
                  </details>
                ))}
              </div>
              {groupsSection ? <SiteLink href={`/${groupsSection.slug}`} locale={locale} className="kosaq-more mt-5 inline-block">{T.allGroups[locale]} →</SiteLink> : null}
            </div>
            <ThemeImage theme={THEME} name="hero" className="kosaq-circle" sizes="(min-width: 1024px) 30vw, 80vw" />
          </div>
        </section>
      ) : null}

      {news.length > 0 ? (
        <section className="kosaq-section kosaq-soft" aria-labelledby="kosaq-news">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <SectionHead id="kosaq-news" title={BLOCK_T.news[locale]} />
              <SiteLink href="/news" locale={locale} className="kosaq-more">{BLOCK_T.allNews[locale]} →</SiteLink>
            </div>
            <div className="kosaq-news mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news.slice(0, 3).map((post) => <NewsCard key={post.id} post={post} locale={locale} />)}
            </div>
          </div>
        </section>
      ) : null}

      <section className="container-page py-8">
        <div className="kosaq-band">
          <div>
            <h2>{T.follow[locale]}</h2>
            <p>{T.followLead[locale]}</p>
          </div>
          {profile?.instagram ? (
            <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="kosaq-band-button">{T.instagram[locale]}</a>
          ) : (
            <EnrollLink menu={menu} locale={locale} className="kosaq-band-button" />
          )}
        </div>
      </section>
    </div>
  );
}
