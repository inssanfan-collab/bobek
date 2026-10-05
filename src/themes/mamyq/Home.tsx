import { NewsCard, SiteLink, T as BLOCK_T } from '@/components/site/blocks';
import { HeroButtons, HeroTitle } from '@/components/site/Hero';
import { RouteMap } from '@/components/site/RouteMap';
import { SocialLinks } from '@/components/site/SocialLinks';
import { Stars } from '@/components/site/sections';
import { CoverOr, EnrollLink, ThemeImage, developmentAreas, findSection } from '@/components/site/theme-kit';
import { homeStats } from '@/lib/home-stats';
import { AnnouncementsList, DocsTable, LatestPhotos } from '@/components/site/theme-blocks';
import { pick, type Locale } from '@/lib/i18n';
import { formatAgeRange } from '@/lib/labels';
import type { HomeProps } from '@/templates/types';
import { ButterflyLine, FlowerLine, Icon, MissionIcon, PlaneLine, ScallopDefs, StarLine, SunLine } from './Doodles';

const THEME = 'mamyq';

type Pair = { kk: [string, string]; ru: [string, string] };

const H: Record<string, Pair> = {
  mission: { kk: ['Біздің мақсат:', 'бақытты балалық шақ, сенімді болашақ'], ru: ['Наша миссия:', 'счастливое детство, уверенное будущее'] },
  prices: { kk: ['Біздің', 'тарифтер'], ru: ['Наши', 'абонементы'] },
  groups: { kk: ['Біздің', 'топтар'], ru: ['Наши', 'группы'] },
  reviews: { kk: ['Ата-аналардың', 'пікірлері'], ru: ['Отзывы', 'родителей'] },
  news: { kk: ['Соңғы', 'жаңалықтар'], ru: ['Последние', 'новости'] },
};

const T = {
  featured: { kk: 'Жиі таңдайды', ru: 'Самый популярный' },
  order: { kk: 'Жазылу', ru: 'Записаться' },
  pricesLead: { kk: 'Балаңызға ыңғайлы форматты таңдаңыз.', ru: 'Выберите формат, который подходит вашему малышу.' },
  groupsLead: { kk: 'Әр топ — баланың жасына сай күн тәртібі мен сабақтар.', ru: 'Каждая группа — распорядок и занятия по возрасту ребёнка.' },
  language: { kk: 'Оқыту тілі', ru: 'Язык обучения' },
  kk: { kk: 'қазақ', ru: 'казахский' },
  ru: { kk: 'орыс', ru: 'русский' },
  free: { kk: 'Бос орын', ru: 'Свободных мест' },
  teachers: { kk: 'Тәрбиешілер', ru: 'Воспитатели' },
  contacts: { kk: 'Біз әрқашан байланыстамыз!', ru: 'Мы всегда на связи!' },
  hours: { kk: 'Жұмыс уақыты', ru: 'Часы работы' },
  address: { kk: 'Мекенжай', ru: 'Адрес' },
  phone: { kk: 'Телефон', ru: 'Телефон' },
  social: { kk: 'Әлеуметтік желілер', ru: 'Соцсети' },
} as const;

function Title({ pair, locale, id, className = '' }: { pair: Pair; locale: Locale; id: string; className?: string }) {
  const [first, accent] = pair[locale];
  return (
    <h2 id={id} className={`mamyq-title ${className}`}>
      {first} <span className="mamyq-pink">{accent}</span>
    </h2>
  );
}

const MISSION = ['house', 'sun', 'pinwheel'];

const KP: Record<'ann' | 'photos' | 'docs', Pair> = {
  ann: { kk: ['Соңғы', 'хабарландырулар'], ru: ['Последние', 'объявления'] },
  photos: { kk: ['Біздің', 'фотогалерея'], ru: ['Наша', 'фотогалерея'] },
  docs: { kk: ['Соңғы', 'құжаттар'], ru: ['Последние', 'документы'] },
};

/**
 * Главная «Мамық» — вплотную к образцу №9: пудровый первый экран
 * с линейными рисунками и фото в рамке-«ромашке», розовая волнистая
 * полоса миссии с тремя пунктами, абонементы (у государственного сада —
 * группы) на узоре из радуг, крупные розовые счётчики, отзывы с радужным
 * свечением, карта и контакты, подвал с полосой рисунков.
 */
export function MamyqHome({ profile, news, newsFeed, announcements = [], documents = [], photos = [], locale, coverUrl, coverPosition, hero, menu, prices = [], groups = [], reviews = [], counts }: HomeProps) {
  const feed = (newsFeed ?? news).slice(0, 9);
  const kitAnn = findSection(menu, 'ANNOUNCEMENT');
  const kitGallery = findSection(menu, 'GALLERY');
  const kitDocs = findSection(menu, 'DOCUMENTS');
  const stats = homeStats(profile, counts, locale);
  const pricesSection = findSection(menu, 'PRICES');
  const groupsSection = findSection(menu, 'GROUPS');
  const areas = developmentAreas(locale);
  const mission = ['social', 'health', 'logic'].map((key) => areas.find((area) => area.key === key)!);
  const address = pick(locale, profile?.addressKk, profile?.addressRu);

  return (
    <div className="mamyq-home">
      <ScallopDefs />
      <section className="mamyq-hero">
        <SunLine className="mamyq-d-sun" />
        <ButterflyLine className="mamyq-d-fly" />
        <FlowerLine className="mamyq-d-flower" />
        <div className="container-page mamyq-hero-grid">
          <div>
            <HeroTitle hero={hero} tone="plain" withEyebrow={false} className="mamyq-h1" />
            {hero.lead ? <p className="mamyq-lead">{hero.lead}</p> : null}
            <div className="mt-7 flex flex-wrap gap-3">
              <HeroButtons hero={hero} tone="plain">
                <EnrollLink menu={menu} locale={locale} className="mamyq-outline" />
              </HeroButtons>
            </div>
          </div>
          <span className="mamyq-scallop mamyq-hero-photo">
            <ThemeImage theme={THEME} name="hero" sizes="(min-width: 1024px) 34vw, 80vw" eager />
          </span>
        </div>
      </section>

      <section className="mamyq-wave" aria-labelledby="mamyq-mission">
        <StarLine className="mamyq-d-star" />
        <PlaneLine className="mamyq-d-plane" />
        <div className="container-page mamyq-mission">
          <span className="mamyq-scallop mamyq-mission-photo"><CoverOr coverUrl={coverUrl} coverPosition={coverPosition} theme={THEME} name="balloons" /></span>
          <div>
            <h2 id="mamyq-mission" className="mamyq-title">
              <span aria-hidden>☀ </span>{H.mission[locale][0]} <span className="mamyq-pink">{H.mission[locale][1]}</span>
            </h2>
            <ul className="mamyq-mission-list">
              {mission.map((item, index) => (
                <li key={item.key}>
                  <MissionIcon name={MISSION[index % 3]} />
                  <span>
                    <b>{item.title}</b>
                    <span>{item.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {prices.length > 0 ? (
        <section className="mamyq-pattern" aria-labelledby="mamyq-prices">
          <div className="container-page py-16 text-center">
            <Title pair={H.prices} locale={locale} id="mamyq-prices" />
            <p className="mamyq-text mt-3"><span aria-hidden>✦ </span>{T.pricesLead[locale]}</p>
            <ul className="mamyq-plans">
              {prices.slice(0, 3).map((plan) => {
                const features = (pick(locale, plan.featuresKk, plan.featuresRu) ?? '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
                return (
                  <li key={plan.id} className={plan.isFeatured ? 'mamyq-plan-featured' : ''}>
                    {plan.isFeatured ? <p className="mamyq-plan-badge">{T.featured[locale]}</p> : null}
                    <span className="mamyq-plan-icon"><Icon name="sparkle" className="h-7 w-7" /></span>
                    <h3>{pick(locale, plan.nameKk, plan.nameRu)}</h3>
                    <p className="mamyq-price">{plan.priceKzt.toLocaleString('ru-RU')} ₸ <span>{pick(locale, plan.periodKk, plan.periodRu)}</span></p>
                    {features.length > 0 ? (
                      <ul className="mamyq-features">
                        {features.map((feature) => <li key={feature}><Icon name="check" className="h-4 w-4 shrink-0" />{feature}</li>)}
                      </ul>
                    ) : null}
                    <EnrollLink menu={menu} locale={locale} className="mamyq-navy-btn">{T.order[locale]}</EnrollLink>
                  </li>
                );
              })}
            </ul>
            {pricesSection ? <SiteLink href={`/${pricesSection.slug}`} locale={locale} className="mamyq-more mt-8 inline-block">{pick(locale, pricesSection.titleKk, pricesSection.titleRu)} →</SiteLink> : null}
          </div>
        </section>
      ) : groups.length > 0 ? (
        <section className="mamyq-pattern" aria-labelledby="mamyq-groups">
          <div className="container-page py-16 text-center">
            <Title pair={H.groups} locale={locale} id="mamyq-groups" />
            <p className="mamyq-text mt-3"><span aria-hidden>✦ </span>{T.groupsLead[locale]}</p>
            <ul className="mamyq-plans">
              {groups.slice(0, 3).map((group, index) => (
                <li key={group.id} className={index === 1 ? 'mamyq-plan-featured' : ''}>
                  <span className="mamyq-plan-icon"><Icon name="group" className="h-7 w-7" /></span>
                  <h3>{pick(locale, group.nameKk, group.nameRu)}</h3>
                  <p className="mamyq-price">{formatAgeRange(group.ageFrom, group.ageTo, locale) ?? ''}</p>
                  <ul className="mamyq-features">
                    <li><Icon name="check" className="h-4 w-4 shrink-0" />{T.language[locale]}: {group.language === 'ru' ? T.ru[locale] : T.kk[locale]}</li>
                    {group.teachers ? <li><Icon name="check" className="h-4 w-4 shrink-0" />{T.teachers[locale]}: {group.teachers}</li> : null}
                    {group.placesFree > 0 ? <li><Icon name="check" className="h-4 w-4 shrink-0" />{T.free[locale]}: {group.placesFree}</li> : null}
                  </ul>
                  {groupsSection ? <SiteLink href={`/${groupsSection.slug}`} locale={locale} className="mamyq-navy-btn">{pick(locale, groupsSection.titleKk, groupsSection.titleRu)}</SiteLink> : null}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {stats.length > 0 ? (
        <ul className="container-page mamyq-stats">
          {stats.map((stat) => (
            <li key={stat.label}>
              <b>{stat.value}</b>
              <span>{stat.label}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {reviews.length > 0 ? (
        <section className="container-page py-14 text-center" aria-labelledby="mamyq-reviews">
          <Title pair={H.reviews} locale={locale} id="mamyq-reviews" />
          <ul className="mamyq-reviews">
            {reviews.slice(0, 3).map((review) => (
              <li key={review.id}>
                {review.rating ? <Stars rating={review.rating} locale={locale} /> : null}
                <blockquote>«{pick(locale, review.textKk, review.textRu)}»</blockquote>
                <p className="mamyq-review-author">
                  <span className="mamyq-avatar" aria-hidden>{review.authorName.trim().charAt(0)}</span>
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
        <section className="container-page py-12" aria-labelledby="mamyq-ann">
          <Title pair={KP.ann} locale={locale} id="mamyq-ann" />
          <div className="mt-8"><AnnouncementsList items={announcements} locale={locale} section={kitAnn} /></div>
        </section>
      ) : null}

      {feed.length > 0 ? (
        <section className="container-page py-12" aria-labelledby="mamyq-news">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <Title pair={H.news} locale={locale} id="mamyq-news" />
            <SiteLink href="/news" locale={locale} className="mamyq-more">{BLOCK_T.allNews[locale]} →</SiteLink>
          </div>
          <div className="mamyq-news mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {feed.map((post) => <NewsCard key={post.id} post={post} locale={locale} />)}
          </div>
        </section>
      ) : null}

      {photos.length > 0 ? (
        <section className="container-page py-12" aria-labelledby="mamyq-photos">
          <Title pair={KP.photos} locale={locale} id="mamyq-photos" />
          <div className="mt-8"><LatestPhotos photos={photos} locale={locale} gallerySection={kitGallery} /></div>
        </section>
      ) : null}

      {documents.length > 0 ? (
        <section className="container-page py-12" aria-labelledby="mamyq-docs">
          <Title pair={KP.docs} locale={locale} id="mamyq-docs" />
          <div className="mt-8"><DocsTable documents={documents} locale={locale} docsSection={kitDocs} /></div>
        </section>
      ) : null}

      {profile ? (
        <section className="container-page mamyq-contacts" aria-labelledby="mamyq-contacts">
          <div className="mamyq-map">
            <RouteMap lat={profile.lat} lng={profile.lng} address={address} locale={locale} />
          </div>
          <div>
            <h2 id="mamyq-contacts" className="mamyq-title">{T.contacts[locale]}</h2>
            <div className="mamyq-contact-grid">
              {profile.workHours ? (
                <div><Icon name="clock" className="mamyq-ci" /><p><b>{T.hours[locale]}</b><span>{profile.workHours}</span></p></div>
              ) : null}
              {address ? (
                <div><Icon name="pin" className="mamyq-ci" /><p><b>{T.address[locale]}</b><span>{address}</span></p></div>
              ) : null}
              {profile.phone ? (
                <div><Icon name="phone" className="mamyq-ci" /><p><b>{T.phone[locale]}</b><a href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`}>{profile.phone}</a></p></div>
              ) : null}
              <div><Icon name="chat" className="mamyq-ci" /><div><b className="mamyq-ci-label">{T.social[locale]}</b><SocialLinks profile={profile} locale={locale} withTitle={false} /></div></div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
