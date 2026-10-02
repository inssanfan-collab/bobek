import { NewsCard, SiteLink, T as BLOCK_T } from '@/components/site/blocks';
import { HeroButtons, HeroTitle } from '@/components/site/Hero';
import { StatsRow } from '@/components/site/home-blocks';
import { Stars } from '@/components/site/sections';
import { CoverOr, EnrollLink, SectionHead, ThemeImage, developmentAreas } from '@/components/site/theme-kit';
import { homeStats } from '@/lib/home-stats';
import { pick } from '@/lib/i18n';
import type { HomeProps } from '@/templates/types';

const THEME = 'kuanysh';

const T = {
  best: { kk: 'Балаңыз үшін ең жақсы жағдай', ru: 'Лучшие условия для ребёнка' },
  about: { kk: 'Біз туралы', ru: 'О нас' },
  aboutTitle: { kk: 'Өсеміз, ойнаймыз, әлемді қуанышпен танимыз', ru: 'Растём, играем и с радостью познаём мир' },
  hours: { kk: 'Жұмыс уақыты', ru: 'Часы работы' },
  phone: { kk: 'Телефон', ru: 'Телефон' },
  langKk: { kk: 'Қазақ тілінде', ru: 'На казахском' },
  langRu: { kk: 'Орыс тілінде', ru: 'На русском' },
  band: { kk: 'Баланың әлеуетін алғашқы қадамнан ашамыз', ru: 'Раскрываем потенциал ребёнка с первых шагов' },
  bandLead: { kk: 'Балабақшамен танысыңыз — тәрбиешілер бәрін көрсетіп, айтып береді.', ru: 'Познакомьтесь с садом — воспитатели всё покажут и расскажут.' },
  lessons: { kk: 'Балаларға арналған сабақтар', ru: 'Занятия для детей' },
  reviews: { kk: 'Ата-аналар пікірлері', ru: 'Отзывы родителей' },
  cta: { kk: 'Экскурсияға жазылыңыз', ru: 'Запишитесь на экскурсию' },
  ctaLead: { kk: 'Өтінім қалдырыңыз — біз хабарласып, ыңғайлы уақытты келісеміз.', ru: 'Оставьте заявку — мы перезвоним и договоримся об удобном времени.' },
} as const;

/**
 * Главная «Қуаныш» — яркие кляксы (структура дизайна №4): фото на
 * жёлто-сиреневой кляксе, три карточки-кляксы, «О нас» с часами работы,
 * зелёная полоса с фото, занятия вокруг центрального фото, отзыв крупно
 * со счётчиками, новости, фиолетовая полоса записи.
 */
export function KuanyshHome({ profile, news, locale, coverUrl, coverPosition, hero, menu, clubs = [], reviews = [], counts }: HomeProps) {
  const stats = homeStats(profile, counts, locale);
  const areas = developmentAreas(locale);
  const blobs = areas.filter((area) => ['health', 'social', 'logic'].includes(area.key));
  const aboutText = pick(locale, profile?.aboutKk, profile?.aboutRu);
  const lessons = clubs.length > 0
    ? clubs.slice(0, 6).map((club) => ({ key: club.id, title: pick(locale, club.nameKk, club.nameRu), text: pick(locale, club.descKk, club.descRu) }))
    : areas;
  const left = lessons.filter((_, index) => index % 2 === 0);
  const right = lessons.filter((_, index) => index % 2 === 1);
  const [mainReview, ...otherReviews] = reviews;
  const langs = [profile?.langKk ? T.langKk[locale] : null, profile?.langRu ? T.langRu[locale] : null].filter(Boolean);

  const lesson = (item: { key: string; title: string; text?: string | null }) => (
    <li key={item.key} className="kuanysh-lesson">
      <span className="kuanysh-lesson-dot" aria-hidden />
      <b>{item.title}</b>
      {item.text ? <span>{item.text}</span> : null}
    </li>
  );

  return (
    <div className="kuanysh-home">
      <section className="kuanysh-hero">
        <div className="container-page grid items-center gap-10 py-12 lg:grid-cols-2 lg:py-16">
          <div>
            {hero.eyebrow ? <p className="kuanysh-pill">{hero.eyebrow}</p> : null}
            <HeroTitle hero={hero} tone="plain" withEyebrow={false} className="kuanysh-h1 font-display" />
            {hero.lead ? <p className="kuanysh-lead">{hero.lead}</p> : null}
            <div className="mt-7 flex flex-wrap gap-3">
              <HeroButtons hero={hero} tone="plain">
                <EnrollLink menu={menu} locale={locale} className="btn-primary" />
              </HeroButtons>
            </div>
            <StatsRow stats={stats} className="kuanysh-stats" />
          </div>
          <div className="kuanysh-blob-wrap">
            <CoverOr coverUrl={coverUrl} coverPosition={coverPosition} theme={THEME} name="hero" className="kuanysh-blob" eager />
          </div>
        </div>
      </section>

      <section className="kuanysh-section" aria-labelledby="kuanysh-best">
        <div className="container-page">
          <SectionHead id="kuanysh-best" title={T.best[locale]} className="kit-head text-center" />
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {blobs.map((area) => (
              <li key={area.key} className="kuanysh-card">
                <span className="kuanysh-card-icon" aria-hidden>✦</span>
                <h3>{area.title}</h3>
                <p>{area.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="kuanysh-section kuanysh-warm" aria-labelledby="kuanysh-about">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2">
          <div className="kuanysh-arc-wrap">
            <ThemeImage theme={THEME} name="paint" className="kuanysh-arc-photo" />
          </div>
          <div>
            <SectionHead id="kuanysh-about" eyebrow={T.about[locale]} title={T.aboutTitle[locale]} />
            {aboutText && aboutText !== hero.lead ? <p className="kuanysh-text mt-4">{aboutText}</p> : null}
            {profile?.workHours || profile?.phone ? (
              <dl className="kuanysh-hours">
                {profile?.workHours ? (<><dt>{T.hours[locale]}</dt><dd>{profile.workHours}</dd></>) : null}
                {profile?.phone ? (<><dt>{T.phone[locale]}</dt><dd><a href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`}>{profile.phone}</a></dd></>) : null}
              </dl>
            ) : null}
            {langs.length > 0 ? (
              <p className="mt-4 flex flex-wrap gap-2">
                {langs.map((lang) => <span key={lang} className="kuanysh-chip">{lang}</span>)}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="kuanysh-band">
          <div>
            <h2 className="kuanysh-band-title">{T.band[locale]}</h2>
            <p className="kuanysh-band-lead">{T.bandLead[locale]}</p>
            <EnrollLink menu={menu} locale={locale} className="kuanysh-band-button" />
          </div>
          <ThemeImage theme={THEME} name="play" className="kuanysh-band-photo" sizes="(min-width: 1024px) 30vw, 80vw" />
        </div>
      </section>

      <section className="kuanysh-section" aria-labelledby="kuanysh-lessons">
        <div className="container-page">
          <SectionHead id="kuanysh-lessons" title={T.lessons[locale]} className="kit-head text-center" />
          <div className="mt-10 grid items-center gap-8 lg:grid-cols-[1fr_auto_1fr]">
            <ul className="space-y-5 lg:text-right">{left.map(lesson)}</ul>
            <ThemeImage theme={THEME} name="hero" className="kuanysh-center" sizes="(min-width: 1024px) 28vw, 100vw" />
            <ul className="space-y-5">{right.map(lesson)}</ul>
          </div>
        </div>
      </section>

      {mainReview ? (
        <section className="kuanysh-section kuanysh-warm" aria-labelledby="kuanysh-reviews">
          <div className="container-page">
            <SectionHead id="kuanysh-reviews" title={T.reviews[locale]} className="kit-head text-center" />
            <div className="mt-10 grid items-center gap-8 lg:grid-cols-[1.3fr_0.7fr]">
              <figure className="kuanysh-quote">
                {mainReview.rating ? <Stars rating={mainReview.rating} locale={locale} /> : null}
                <blockquote>{pick(locale, mainReview.textKk, mainReview.textRu)}</blockquote>
                <figcaption>
                  <b>{mainReview.authorName}</b>
                  {pick(locale, mainReview.authorNoteKk, mainReview.authorNoteRu) ? <span> · {pick(locale, mainReview.authorNoteKk, mainReview.authorNoteRu)}</span> : null}
                </figcaption>
              </figure>
              <StatsRow stats={stats} className="kuanysh-bubbles" />
            </div>
            {otherReviews.length > 0 ? (
              <ul className="mt-8 grid gap-6 md:grid-cols-2">
                {otherReviews.slice(0, 2).map((review) => (
                  <li key={review.id} className="kuanysh-small-quote">
                    <p>{pick(locale, review.textKk, review.textRu)}</p>
                    <b>{review.authorName}</b>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      ) : null}

      {news.length > 0 ? (
        <section className="kuanysh-section" aria-labelledby="kuanysh-news">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <SectionHead id="kuanysh-news" title={BLOCK_T.news[locale]} />
              <SiteLink href="/news" locale={locale} className="kuanysh-more">{BLOCK_T.allNews[locale]} →</SiteLink>
            </div>
            <div className="kuanysh-news mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news.slice(0, 3).map((post) => <NewsCard key={post.id} post={post} locale={locale} />)}
            </div>
          </div>
        </section>
      ) : null}

      <section className="container-page pb-6">
        <div className="kuanysh-cta-band">
          <h2>{T.cta[locale]}</h2>
          <p>{T.ctaLead[locale]}</p>
          <EnrollLink menu={menu} locale={locale} className="kuanysh-band-button" />
        </div>
      </section>
    </div>
  );
}
