import { NewsCard, SiteLink, T as BLOCK_T, mediaUrl } from '@/components/site/blocks';
import { HeroButtons, HeroTitle } from '@/components/site/Hero';
import { RouteMap } from '@/components/site/RouteMap';
import { SocialLinks } from '@/components/site/SocialLinks';
import { Stars } from '@/components/site/sections';
import { EnrollLink, ThemeImage, aboutSection, developmentAreas, findSection } from '@/components/site/theme-kit';
import { AnnouncementsList, DocsTable, LatestPhotos } from '@/components/site/theme-blocks';
import { pick } from '@/lib/i18n';
import type { HomeProps } from '@/templates/types';
import { CloudOutline, Sparks } from './Doodles';

const THEME = 'erekshe';

const T = {
  more: { kk: 'Толығырақ білу', ru: 'Узнать больше' },
  head: { kk: 'Меңгеруші', ru: 'Заведующая' },
  aboutEyebrow: { kk: 'Мемлекеттік стандартқа сай білім беру', ru: 'Образование по государственному стандарту' },
  aboutTitle: { kk: 'Балаларды жан-жақты дамытудың заманауи әдістері', ru: 'Современные методы всестороннего развития детей' },
  routine: { kk: 'Балабақша күн тәртібі', ru: 'Распорядок дня в саду' },
  staff: { kk: 'Біздің мамандар', ru: 'Наши специалисты' },
  allStaff: { kk: 'Барлық педагогтар', ru: 'Все педагоги' },
  reviews: { kk: 'Ата-аналар пікірлері', ru: 'Отзывы родителей' },
  contacts: { kk: 'Мекенжайымыз', ru: 'Наш адрес' },
  contactsTitle: { kk: 'Байланыс', ru: 'Контакты' },
  hours: { kk: 'Жұмыс кестесі', ru: 'Режим работы' },
} as const;

/** Картинка к пункту распорядка — по смыслу; занятия и игры чередуются. */
function routineImage(title: string, index: number): string {
  const t = title.toLowerCase();
  // Сон — первым: в «Тихий час» есть буквы «ас», а «ас» — это «еда».
  if (/ұйқы|сон|тихий/.test(t)) return 'sleep';
  if (/(^|\s)ас(\s|$)|тамақ|завтрак|обед|полдник|ужин|питани/.test(t)) return 'meal';
  if (/серуен|прогулк|улиц/.test(t)) return 'walk';
  if (/сурет|рисов/.test(t)) return 'draw';
  if (/би|музык|ән|танц/.test(t)) return 'dance';
  if (/дене|спорт|физкульт|гимнаст/.test(t)) return 'gym';
  if (/сабақ|оқу|занят|іс-әрекет|урок/.test(t)) return ['lesson', 'read', 'draw'][index % 3];
  return ['dance', 'sing', 'gym'][index % 3];
}

const PILLS = ['erekshe-pill-pink', 'erekshe-pill-green', 'erekshe-pill-violet', 'erekshe-pill-blue', 'erekshe-pill-yellow'];

const K = {
  ann: { kk: 'Хабарландырулар', ru: 'Объявления' },
  annMark: { kk: 'Ақпарат', ru: 'Информация' },
  photos: { kk: 'Фотогалерея', ru: 'Фотогалерея' },
  photosMark: { kk: 'Сәттер', ru: 'Моменты' },
  docs: { kk: 'Соңғы құжаттар', ru: 'Последние документы' },
  docsMark: { kk: 'Құжаттар', ru: 'Документы' },
} as const;

/**
 * Главная «Ерекше» — вплотную к образцу №6: слоган с выделенным словом
 * в жёлтой рамке и карточкой заведующей, малыш-вырезка в голубом круге
 * с пирамидкой и облаком; фото ладошек в краске и рукописный розовый
 * заголовок; распорядок мозаикой фото с цветными подписями; специалисты
 * карточками с круглым фото; адрес с картой. Фото — сгенерированные.
 */
export function ErekshHome({ profile, news, newsFeed, announcements = [], documents = [], photos = [], locale, hero, menu, routine = [], staff = [], reviews = [] }: HomeProps) {
  const feed = (newsFeed ?? news).slice(0, 9);
  const kitAnn = findSection(menu, 'ANNOUNCEMENT');
  const kitGallery = findSection(menu, 'GALLERY');
  const kitDocs = findSection(menu, 'DOCUMENTS');
  const headName = pick(locale, profile?.headNameKk, profile?.headNameRu);
  // Фото заведующей — только настоящее, из карточки педагога.
  const headCard = staff.find((member) => /меңгеруш|заведующ/i.test(`${member.positionKk} ${member.positionRu}`));
  const headPhoto = mediaUrl(headCard?.photo);
  const about = aboutSection(menu);
  const staffSection = findSection(menu, 'STAFF');
  const aboutText = pick(locale, profile?.aboutKk, profile?.aboutRu);
  const tiles = routine.slice(0, 5);
  const address = pick(locale, profile?.addressKk, profile?.addressRu);

  return (
    <div className="erekshe-home">
      <section className="container-page erekshe-hero">
        <div>
          {hero.eyebrow ? <p className="erekshe-eyebrow">{hero.eyebrow}</p> : null}
          <div className="relative">
            <HeroTitle hero={hero} tone="plain" withEyebrow={false} className="erekshe-h1" />
            {hero.highlight ? <Sparks className="erekshe-sparks" /> : null}
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
                <b className="block">{headName}</b>
                <span>{T.head[locale]}</span>
              </p>
            </div>
          ) : null}
          {hero.lead ? <p className="erekshe-lead">{hero.lead}</p> : null}
          <div className="mt-7 flex flex-wrap gap-3">
            <HeroButtons hero={hero} tone="plain">
              <EnrollLink menu={menu} locale={locale} className="erekshe-btn" />
            </HeroButtons>
          </div>
        </div>
        <div className="erekshe-orb-wrap" aria-hidden>
          <CloudOutline className="erekshe-cloud" />
          <span className="erekshe-orb" />
          <ThemeImage theme={THEME} name="boy" className="erekshe-boy" sizes="(min-width: 1024px) 34vw, 80vw" eager />
          <ThemeImage theme={THEME} name="pyramid" className="erekshe-pyramid" sizes="8rem" eager />
        </div>
      </section>

      <section className="erekshe-tint" aria-labelledby="erekshe-about">
        <div className="container-page erekshe-about">
          <ThemeImage theme={THEME} name="hands" className="erekshe-photo" sizes="(min-width: 1024px) 40vw, 100vw" />
          <div>
            <p className="erekshe-eyebrow">{T.aboutEyebrow[locale]}</p>
            <h2 id="erekshe-about" className="erekshe-script">{T.aboutTitle[locale]}</h2>
            {aboutText && aboutText !== hero.lead ? <p className="erekshe-text mt-4">{aboutText}</p> : null}
            <ul className="erekshe-dots">
              {developmentAreas(locale, 4).map((area) => <li key={area.key}>{area.title}</li>)}
            </ul>
            {about ? <SiteLink href={`/${about.slug}`} locale={locale} className="erekshe-btn mt-7">{T.more[locale]}</SiteLink> : null}
          </div>
        </div>

        {tiles.length > 0 ? (
          <section className="container-page pb-16" aria-labelledby="erekshe-routine">
            <h2 id="erekshe-routine" className="erekshe-script text-center">{T.routine[locale]}</h2>
            <ol className={`erekshe-mosaic erekshe-mosaic-${tiles.length}`}>
              {tiles.map((item, index) => (
                <li key={item.id}>
                  <ThemeImage theme={THEME} name={routineImage(`${item.titleKk} ${item.titleRu}`, index)} sizes={index === 0 ? '(min-width: 1024px) 40vw, 100vw' : '(min-width: 1024px) 25vw, 50vw'} />
                  <span className={`erekshe-pill ${PILLS[index % PILLS.length]}`}>
                    {pick(locale, item.titleKk, item.titleRu)} · {item.time}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </section>

      {staff.length > 0 ? (
        <section className="erekshe-staff-wrap" aria-labelledby="erekshe-staff">
          <div className="container-page py-16">
            <h2 id="erekshe-staff" className="erekshe-script text-center">{T.staff[locale]}</h2>
            <ul className="erekshe-staff">
              {staff.slice(0, 6).map((member) => {
                const photo = mediaUrl(member.photo);
                return (
                  <li key={member.id}>
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element -- медиа отдаёт свой роут
                      <img src={photo} alt="" className="erekshe-staff-photo" loading="lazy" />
                    ) : (
                      <span className="erekshe-staff-photo erekshe-head-empty" aria-hidden>{member.fullName.trim().charAt(0)}</span>
                    )}
                    <span className="erekshe-staff-role">{pick(locale, member.positionKk, member.positionRu)}</span>
                    <b>{member.fullName}</b>
                    {member.categoryName || member.experience ? <span className="erekshe-staff-meta">{[member.categoryName, member.experience].filter(Boolean).join(' · ')}</span> : null}
                  </li>
                );
              })}
            </ul>
            {staffSection && staff.length > 6 ? (
              <p className="mt-8 text-center"><SiteLink href={`/${staffSection.slug}`} locale={locale} className="erekshe-btn">{T.allStaff[locale]}</SiteLink></p>
            ) : null}
          </div>
        </section>
      ) : null}

      {announcements.length > 0 ? (
        <section className="container-page py-12" aria-labelledby="erekshe-ann">
          <h2 id="erekshe-ann" className="erekshe-script">{K.ann[locale]}</h2>
          <div className="mt-8"><AnnouncementsList items={announcements} locale={locale} section={kitAnn} /></div>
        </section>
      ) : null}

      {feed.length > 0 ? (
        <section className="container-page py-12" aria-labelledby="erekshe-news">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="erekshe-news" className="erekshe-script">{BLOCK_T.news[locale]}</h2>
            <SiteLink href="/news" locale={locale} className="erekshe-more">{BLOCK_T.allNews[locale]} →</SiteLink>
          </div>
          <div className="erekshe-news mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {feed.map((post) => <NewsCard key={post.id} post={post} locale={locale} />)}
          </div>
        </section>
      ) : null}

      {photos.length > 0 ? (
        <section className="container-page py-12" aria-labelledby="erekshe-photos">
          <h2 id="erekshe-photos" className="erekshe-script">{K.photos[locale]}</h2>
          <div className="mt-8"><LatestPhotos photos={photos} locale={locale} gallerySection={kitGallery} /></div>
        </section>
      ) : null}

      {documents.length > 0 ? (
        <section className="container-page py-12" aria-labelledby="erekshe-docs">
          <h2 id="erekshe-docs" className="erekshe-script">{K.docs[locale]}</h2>
          <div className="mt-8"><DocsTable documents={documents} locale={locale} docsSection={kitDocs} /></div>
        </section>
      ) : null}

      {reviews.length > 0 ? (
        <section className="container-page py-12" aria-labelledby="erekshe-reviews">
          <h2 id="erekshe-reviews" className="erekshe-script text-center">{T.reviews[locale]}</h2>
          <ul className="erekshe-reviews">
            {reviews.slice(0, 3).map((review) => (
              <li key={review.id}>
                <figure>
                  {review.rating ? <Stars rating={review.rating} locale={locale} /> : null}
                  <blockquote>{pick(locale, review.textKk, review.textRu)}</blockquote>
                  <figcaption>
                    <b className="block">{review.authorName}</b>
                    {pick(locale, review.authorNoteKk, review.authorNoteRu) ? <span className="text-sm">{pick(locale, review.authorNoteKk, review.authorNoteRu)}</span> : null}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {profile ? (
        <section className="container-page erekshe-contacts" aria-labelledby="erekshe-contacts">
          <div>
            <h2 id="erekshe-contacts" className="erekshe-script">{T.contacts[locale]}</h2>
            {address ? <p className="mt-3 font-bold">{address}</p> : null}
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="erekshe-label">{T.contactsTitle[locale]}</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {profile.phone ? <li><a href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`}>{profile.phone}</a></li> : null}
                  {profile.phoneExtra ? <li>{profile.phoneExtra}</li> : null}
                  {profile.email ? <li><a href={`mailto:${profile.email}`} className="break-all">{profile.email}</a></li> : null}
                </ul>
              </div>
              {profile.workHours ? (
                <div>
                  <p className="erekshe-label">{T.hours[locale]}</p>
                  <p className="mt-2 text-sm">{profile.workHours}</p>
                </div>
              ) : null}
            </div>
            <div className="erekshe-social mt-6"><SocialLinks profile={profile} locale={locale} withTitle={false} /></div>
          </div>
          <div className="erekshe-map">
            <RouteMap lat={profile.lat} lng={profile.lng} address={address} locale={locale} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
