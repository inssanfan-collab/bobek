import { ContactCard, NewsCard, SiteLink, T as BLOCK_T, mediaUrl } from '@/components/site/blocks';
import { HeroButtons, HeroTitle } from '@/components/site/Hero';
import { StaffCards } from '@/components/site/home-blocks';
import { RouteMap } from '@/components/site/RouteMap';
import { ReviewList } from '@/components/site/sections';
import { CoverOr, EnrollLink, SectionHead, ThemeImage, aboutSection, developmentAreas, findSection } from '@/components/site/theme-kit';
import { pick } from '@/lib/i18n';
import { formatAgeRange } from '@/lib/labels';
import type { HomeProps } from '@/templates/types';
import { Scribble, Star } from './Doodles';

const THEME = 'erekshe';

const T = {
  more: { kk: 'Толығырақ білу', ru: 'Узнать больше' },
  head: { kk: 'Меңгеруші', ru: 'Заведующая' },
  aboutEyebrow: { kk: 'Біздің мақсат', ru: 'Наша цель' },
  aboutTitle: { kk: 'Балалардың жан-жақты дамуының заманауи әдістері', ru: 'Современные методы всестороннего развития детей' },
  routineEyebrow: { kk: 'Күн тәртібі', ru: 'Распорядок' },
  routine: { kk: 'Балабақшадағы бір күн', ru: 'Один день в саду' },
  staffEyebrow: { kk: 'Педагогикалық құрам', ru: 'Педагогический состав' },
  staff: { kk: 'Біздің мамандар', ru: 'Наши специалисты' },
  allStaff: { kk: 'Барлық педагогтар', ru: 'Все педагоги' },
  reviews: { kk: 'Ата-аналар пікірлері', ru: 'Отзывы родителей' },
  contactsEyebrow: { kk: 'Бізге келіңіз', ru: 'Приходите к нам' },
  contacts: { kk: 'Мекенжайымыз бен байланыс', ru: 'Адрес и контакты' },
  groups: { kk: 'топ', ru: 'групп' },
} as const;

/** Картинка к пункту распорядка — по смыслу: еда, занятия, прогулка, сон, игры. */
function routineImage(title: string): string {
  const t = title.toLowerCase();
  if (/ас|тамақ|завтрак|обед|полдник|ужин|питани/.test(t)) return 'meal';
  if (/серуен|прогулк|ойын алаң|улиц/.test(t)) return 'walk';
  if (/ұйқы|сон|тихий/.test(t)) return 'sleep';
  if (/сабақ|оқу|занят|іс-әрекет|урок/.test(t)) return 'lessons';
  return 'play';
}

/**
 * Главная «Ерекше» — светлая и современная (структура дизайна №6):
 * первый экран со слоганом, карточкой заведующей и круглым фото; «О нас»
 * с направлениями развития; распорядок дня фото-плитками; специалисты;
 * новости и отзывы; адрес с картой.
 */
export function ErekshHome({ profile, news, locale, coverUrl, coverPosition, hero, menu, routine = [], staff = [], reviews = [], groups = [] }: HomeProps) {
  const headName = pick(locale, profile?.headNameKk, profile?.headNameRu);
  // Фото заведующей — из карточки педагога, если она там есть.
  const headCard = staff.find((member) => /меңгеруш|заведующ/i.test(`${member.positionKk} ${member.positionRu}`));
  const headPhoto = mediaUrl(headCard?.photo);
  const ages = groups.flatMap((group) => [group.ageFrom, group.ageTo]).filter((age): age is number => age != null);
  const ageBadge = ages.length > 0 ? formatAgeRange(Math.min(...ages), Math.max(...ages), locale) : null;
  const about = aboutSection(menu);
  const staffSection = findSection(menu, 'STAFF');
  const aboutText = pick(locale, profile?.aboutKk, profile?.aboutRu);

  return (
    <div className="erekshe-home">
      <section className="erekshe-hero">
        <div className="container-page grid items-center gap-10 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div>
            {hero.eyebrow ? <p className="erekshe-pill">{hero.eyebrow}</p> : null}
            <HeroTitle hero={hero} tone="plain" withEyebrow={false} className="erekshe-h1 font-display" />
            {hero.lead ? <p className="erekshe-lead">{hero.lead}</p> : null}
            <div className="mt-7 flex flex-wrap gap-3">
              <HeroButtons hero={hero} tone="plain">
                <EnrollLink menu={menu} locale={locale} className="btn-primary" />
                {about ? <SiteLink href={`/${about.slug}`} locale={locale} className="btn-secondary">{T.more[locale]}</SiteLink> : null}
              </HeroButtons>
            </div>
            {headName ? (
              <div className="erekshe-head">
                {headPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element -- медиа отдаёт свой роут
                  <img src={headPhoto} alt="" className="erekshe-head-photo" />
                ) : (
                  <span className="erekshe-head-photo erekshe-head-empty" aria-hidden>{headName.charAt(0)}</span>
                )}
                <p>
                  <span className="erekshe-head-name">{headName}</span>
                  <span className="erekshe-head-role">{T.head[locale]}</span>
                </p>
              </div>
            ) : null}
          </div>
          <div className="erekshe-circle-wrap">
            <CoverOr coverUrl={coverUrl} coverPosition={coverPosition} theme={THEME} name="hero" className="erekshe-circle" eager />
            {ageBadge ? <p className="erekshe-float erekshe-float-top">{ageBadge}</p> : null}
            {groups.length > 0 ? <p className="erekshe-float erekshe-float-bottom"><b>{groups.length}</b> {T.groups[locale]}</p> : null}
            <Star className="erekshe-doodle erekshe-star" />
          </div>
        </div>
      </section>

      <section className="erekshe-section erekshe-tint" aria-labelledby="erekshe-about">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2">
          <ThemeImage theme={THEME} name="lessons" className="erekshe-photo" />
          <div>
            <SectionHead id="erekshe-about" eyebrow={T.aboutEyebrow[locale]} title={T.aboutTitle[locale]} />
            <Scribble className="erekshe-scribble" />
            {aboutText && aboutText !== hero.lead ? <p className="erekshe-text mt-4">{aboutText}</p> : null}
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {developmentAreas(locale, 4).map((area) => (
                <li key={area.key} className="erekshe-check">
                  <b>{area.title}</b>
                  <span>{area.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {routine.length > 0 ? (
        <section className="erekshe-section" aria-labelledby="erekshe-routine">
          <div className="container-page">
            <SectionHead id="erekshe-routine" eyebrow={T.routineEyebrow[locale]} title={T.routine[locale]} className="kit-head text-center" />
            <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {routine.slice(0, 6).map((item) => {
                const title = pick(locale, item.titleKk, item.titleRu);
                return (
                  <li key={item.id} className="erekshe-tile">
                    <ThemeImage theme={THEME} name={routineImage(`${item.titleKk} ${item.titleRu}`)} className="erekshe-tile-photo" sizes="(min-width: 1024px) 33vw, 100vw" />
                    <span className="erekshe-tile-time">{item.time}</span>
                    <span className="erekshe-tile-title">{title}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      ) : null}

      {staff.length > 0 ? (
        <section className="erekshe-section erekshe-tint" aria-labelledby="erekshe-staff">
          <div className="container-page">
            <SectionHead id="erekshe-staff" eyebrow={T.staffEyebrow[locale]} title={T.staff[locale]} className="kit-head text-center" />
            <StaffCards staff={staff} locale={locale} limit={6} className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" />
            {staffSection && staff.length > 6 ? (
              <p className="mt-8 text-center">
                <SiteLink href={`/${staffSection.slug}`} locale={locale} className="btn-secondary">{T.allStaff[locale]}</SiteLink>
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      {news.length > 0 ? (
        <section className="erekshe-section" aria-labelledby="erekshe-news">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <SectionHead id="erekshe-news" title={BLOCK_T.news[locale]} />
              <SiteLink href="/news" locale={locale} className="erekshe-more">{BLOCK_T.allNews[locale]} →</SiteLink>
            </div>
            <div className="erekshe-news mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news.slice(0, 3).map((post) => <NewsCard key={post.id} post={post} locale={locale} />)}
            </div>
          </div>
        </section>
      ) : null}

      {reviews.length > 0 ? (
        <section className="erekshe-section erekshe-tint" aria-labelledby="erekshe-reviews">
          <div className="container-page">
            <SectionHead id="erekshe-reviews" title={T.reviews[locale]} className="kit-head text-center" />
            <ReviewList reviews={reviews.slice(0, 3)} locale={locale} className="erekshe-reviews mt-10 grid gap-6 md:grid-cols-3" />
          </div>
        </section>
      ) : null}

      {profile ? (
        <section className="erekshe-section" aria-labelledby="erekshe-contacts">
          <div className="container-page">
            <SectionHead id="erekshe-contacts" eyebrow={T.contactsEyebrow[locale]} title={T.contacts[locale]} className="kit-head text-center" />
            <div className="mt-10 grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="erekshe-contact"><ContactCard profile={profile} locale={locale} /></div>
              <div className="erekshe-map">
                <RouteMap lat={profile.lat} lng={profile.lng} address={pick(locale, profile.addressKk, profile.addressRu)} locale={locale} />
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
