import { NewsCard, SiteLink, T as BLOCK_T, mediaUrl } from '@/components/site/blocks';
import { HeroButtons, HeroTitle } from '@/components/site/Hero';
import { RouteMap } from '@/components/site/RouteMap';
import { Stars } from '@/components/site/sections';
import { EnrollLink, ThemeImage, aboutSection, developmentAreas, findSection } from '@/components/site/theme-kit';
import { homeStats } from '@/lib/home-stats';
import { pick, type Locale } from '@/lib/i18n';
import type { HomeProps } from '@/templates/types';

const THEME = 'nur';

/** Заголовок образца: красный рукописный, одно слово — золотым. */
type Parts = { kk: [string, string, string]; ru: [string, string, string] };

const H: Record<string, Parts> = {
  programs: { kk: ['Біздің', 'білім беру', 'бағыттарымыз'], ru: ['Наши', 'образовательные', 'направления'] },
  staff: { kk: ['Біздің', 'мамандарымыз', ''], ru: ['Наши', 'специалисты', ''] },
  reviews: { kk: ['Ата-аналардың', 'пікірлері', ''], ru: ['Отзывы', 'наших', 'родителей'] },
  news: { kk: ['Соңғы', 'жаңалықтар', ''], ru: ['Последние', 'новости', ''] },
  contacts: { kk: ['', 'Біздің', 'мекенжайымыз'], ru: ['', 'Наши', 'координаты'] },
};

const T = {
  welcome: { kk: 'Балабақшамызға қош келдіңіздер!', ru: 'Добро пожаловать в наш детский сад!' },
  ask: { kk: 'Сұрақ қою', ru: 'Задать вопрос' },
  enroll: { kk: 'Баланы жазу', ru: 'Записать ребёнка' },
  askTitle: { kk: 'Сұрағыңыз бар ма?', ru: 'Есть вопрос?' },
  askText: { kk: 'Жазыңыз немесе экскурсияға келіңіз — біз міндетті түрде жауап береміз.', ru: 'Напишите нам или приходите на экскурсию — мы обязательно ответим.' },
  contactsLead: { kk: 'Келіңіз, балабақшамызбен танысыңыз.', ru: 'Приходите знакомиться с детским садом.' },
  allStaff: { kk: 'Барлық педагогтар', ru: 'Все педагоги' },
} as const;

function Title({ parts, locale, id, className = '' }: { parts: Parts; locale: Locale; id: string; className?: string }) {
  const [before, gold, after] = parts[locale];
  return (
    <h2 id={id} className={`nur-script ${className}`}>
      {before ? `${before} ` : ''}<span className="nur-gold">{gold}</span>{after ? ` ${after}` : ''}
    </h2>
  );
}

const TOYS = ['ball', 'top', 'abc'];

/**
 * Главная «Нұр» — вплотную к образцу №7: фото девочки с ладошками
 * в краске на всю ширину и белая плашка с рукописным заголовком; фото
 * сверху на детей и наложенная карточка приветствия со счётчиками;
 * три направления с игрушками на облачном фоне; специалисты высокими
 * фото в жёлтой рамке; отзывы на облаках; плашка вопроса и адрес
 * с картой; красный подвал. Фото и игрушки — сгенерированные.
 */
export function NurHome({ profile, news, locale, hero, menu, staff = [], reviews = [], counts }: HomeProps) {
  const stats = homeStats(profile, counts, locale).slice(0, 3);
  const about = aboutSection(menu);
  const staffSection = findSection(menu, 'STAFF');
  const aboutText = pick(locale, profile?.aboutKk, profile?.aboutRu);
  const areas = developmentAreas(locale);
  const programs = ['health', 'social', 'speech'].map((key) => areas.find((area) => area.key === key)!);
  const address = pick(locale, profile?.addressKk, profile?.addressRu);

  return (
    <div className="nur-home">
      <section className="nur-hero">
        <ThemeImage theme={THEME} name="hero" className="nur-hero-photo" sizes="100vw" eager />
        <div className="container-page nur-hero-inner">
          <div className="nur-hero-box">
            <HeroTitle hero={hero} tone="plain" withEyebrow={false} className="nur-h1" />
            {hero.lead ? <p className="nur-lead">{hero.lead}</p> : null}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <HeroButtons hero={hero} tone="plain">
                <EnrollLink menu={menu} locale={locale} className="nur-outline">{T.enroll[locale]}</EnrollLink>
              </HeroButtons>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page nur-welcome" aria-labelledby="nur-welcome">
        <ThemeImage theme={THEME} name="topdown" className="nur-welcome-photo" sizes="(min-width: 1024px) 40vw, 100vw" />
        <div className="nur-welcome-side">
          <div className="nur-welcome-card">
            <h2 id="nur-welcome" className="nur-script nur-gold">{T.welcome[locale]}</h2>
            {aboutText ? <p className="nur-text mt-4">{aboutText}</p> : null}
            <EnrollLink menu={menu} locale={locale} className="nur-outline mt-6">{T.ask[locale]}</EnrollLink>
          </div>
          {stats.length > 0 ? (
            <ul className="nur-stats">
              {stats.map((stat) => (
                <li key={stat.label}>
                  <b>{stat.value}</b>
                  <span>{stat.label}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      <section className="nur-clouds" aria-labelledby="nur-programs">
        <div className="container-page py-16 text-center">
          <Title parts={H.programs} locale={locale} id="nur-programs" />
          <ul className="nur-programs">
            {programs.map((program, index) => (
              <li key={program.key}>
                <ThemeImage theme={THEME} name={TOYS[index % 3]} className="nur-toy" sizes="6rem" />
                <b className="nur-script nur-program-title">{program.title}</b>
                <span>{program.text}</span>
              </li>
            ))}
          </ul>
          {about ? <SiteLink href={`/${about.slug}`} locale={locale} className="nur-outline mt-10">{pick(locale, about.titleKk, about.titleRu)}</SiteLink> : null}
        </div>
      </section>

      {staff.length > 0 ? (
        <section className="container-page py-16 text-center" aria-labelledby="nur-staff">
          <Title parts={H.staff} locale={locale} id="nur-staff" />
          <ul className="nur-staff">
            {staff.slice(0, 4).map((member) => {
              const photo = mediaUrl(member.photo);
              return (
                <li key={member.id}>
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element -- медиа отдаёт свой роут
                    <img src={photo} alt="" className="nur-staff-photo" loading="lazy" />
                  ) : (
                    <span className="nur-staff-photo nur-staff-empty" aria-hidden>{member.fullName.trim().charAt(0)}</span>
                  )}
                  <b>{member.fullName}</b>
                  <span>{pick(locale, member.positionKk, member.positionRu)}</span>
                </li>
              );
            })}
          </ul>
          {staffSection && staff.length > 4 ? <SiteLink href={`/${staffSection.slug}`} locale={locale} className="nur-outline mt-8">{T.allStaff[locale]}</SiteLink> : null}
        </section>
      ) : null}

      {reviews.length > 0 ? (
        <section className="nur-clouds" aria-labelledby="nur-reviews">
          <div className="container-page py-16 text-center">
            <Title parts={H.reviews} locale={locale} id="nur-reviews" />
            <ul className="nur-reviews">
              {reviews.slice(0, 3).map((review) => (
                <li key={review.id}>
                  <span className="nur-avatar" aria-hidden>{review.authorName.trim().charAt(0)}</span>
                  <b>{review.authorName}</b>
                  {review.rating ? <Stars rating={review.rating} locale={locale} /> : null}
                  <blockquote>{pick(locale, review.textKk, review.textRu)}</blockquote>
                  {pick(locale, review.authorNoteKk, review.authorNoteRu) ? <span className="text-sm">{pick(locale, review.authorNoteKk, review.authorNoteRu)}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {news.length > 0 ? (
        <section className="container-page py-16" aria-labelledby="nur-news">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <Title parts={H.news} locale={locale} id="nur-news" />
            <SiteLink href="/news" locale={locale} className="nur-more">{BLOCK_T.allNews[locale]} →</SiteLink>
          </div>
          <div className="nur-news mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.slice(0, 3).map((post) => <NewsCard key={post.id} post={post} locale={locale} />)}
          </div>
        </section>
      ) : null}

      <section className="container-page nur-contacts" aria-labelledby="nur-contacts">
        <div className="nur-ask">
          <p className="nur-script nur-ask-title">{T.askTitle[locale]}</p>
          <p className="mt-3">{T.askText[locale]}</p>
          <EnrollLink menu={menu} locale={locale} className="nur-red-btn mt-6">{T.ask[locale]}</EnrollLink>
        </div>
        <div>
          <Title parts={H.contacts} locale={locale} id="nur-contacts" />
          <p className="nur-text mt-2">{T.contactsLead[locale]}</p>
          {profile ? (
            <div className="nur-map mt-5">
              <RouteMap lat={profile.lat} lng={profile.lng} address={address} locale={locale} />
            </div>
          ) : null}
          <ul className="nur-contact-list">
            {profile?.phone ? <li><span aria-hidden>☏</span><a href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`}>{profile.phone}</a></li> : null}
            {profile?.email ? <li><span aria-hidden>✉</span><a href={`mailto:${profile.email}`} className="break-all">{profile.email}</a></li> : null}
            {profile?.workHours ? <li><span aria-hidden>◷</span>{profile.workHours}</li> : null}
            {address ? <li><span aria-hidden>⌖</span>{address}</li> : null}
          </ul>
        </div>
      </section>
    </div>
  );
}
