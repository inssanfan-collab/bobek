import { SiteLink, mediaUrl } from '@/components/site/blocks';
import { LinkButton } from '@/components/site/Hero';
import { GroupCards, StaffCards } from '@/components/site/home-blocks';
import { AnnouncementsList, DocLink, LatestPhotos, docFormat } from '@/components/site/theme-blocks';
import { EnrollLink, ThemeImage, findSection } from '@/components/site/theme-kit';
import { formatSize } from '@/lib/file-cards';
import { pick } from '@/lib/i18n';
import { formatDate } from '@/lib/labels';
import type { HomeProps } from '@/templates/types';

const T = {
  news: { kk: 'Жаңалықтар', ru: 'Новости' },
  allNews: { kk: 'Барлық жаңалықтар', ru: 'Все новости' },
  announcements: { kk: 'Хабарландырулар', ru: 'Объявления' },
  documents: { kk: 'Құжаттар', ru: 'Документы' },
  gallery: { kk: 'Фотогалерея', ru: 'Фотогалерея' },
  slider: { kk: 'Басты жаңалықтар', ru: 'Главные новости' },
  prev: { kk: 'Алдыңғы жаңалық', ru: 'Предыдущая новость' },
  next: { kk: 'Келесі жаңалық', ru: 'Следующая новость' },
  tabs: { kk: 'Бөлімдер', ru: 'Разделы сайта' },
  head: { kk: 'Меңгеруші', ru: 'Заведующая' },
  reception: { kk: 'Виртуалды қабылдау', ru: 'Виртуальная приёмная' },
  queue: { kk: 'Балабақшаға кезек', ru: 'Очередь в детский сад' },
  contacts: { kk: 'Байланыс', ru: 'Контакты' },
  address: { kk: 'Мекенжай', ru: 'Адрес' },
  phones: { kk: 'Телефондар', ru: 'Телефоны' },
  hours: { kk: 'Жұмыс кестесі', ru: 'Режим работы' },
  map: { kk: 'Картадан қарау', ru: 'Посмотреть на карте' },
  groups: { kk: 'Топтар', ru: 'Группы' },
  staff: { kk: 'Педагогтар', ru: 'Педагоги' },
  allStaff: { kk: 'Барлық педагогтар', ru: 'Все педагоги' },
  allDocs: { kk: 'Барлық құжаттар', ru: 'Все документы' },
  newTab: { kk: 'жаңа терезеде ашылады', ru: 'откроется в новой вкладке' },
} as const;

function Arrow({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10.5" />
      <path d={dir === 'left' ? 'M13.5 8 9.5 12l4 4' : 'm10.5 8 4 4-4 4'} />
    </svg>
  );
}

/**
 * Главная «Акорда» — повторяет раскладку akorda.kz: белая карточка с главной
 * новостью (снимок слева, дата и заголовок справа на узорной полосе, стрелки
 * и «1 / 5»), под ней серая таблетка с разделами, затем «События» двумя
 * колонками — лента новостей со снимками слева, серая колонка справа
 * (у образца там виджет твиттера, у нас объявления и контакты), блок
 * руководителя с кнопкой приёмной и подвал на тёмном. Листание главной
 * новости — на радиокнопках, без скриптов. Всё — из данных сада.
 */
export function AkordaHome({
  profile,
  news,
  newsFeed,
  announcements = [],
  documents = [],
  photos = [],
  groups = [],
  staff = [],
  locale,
  coverUrl,
  coverPosition,
  hero,
  menu,
}: HomeProps) {
  const feed = (newsFeed ?? news).slice(0, 8);
  const slides = feed.slice(0, 5);
  const reception = findSection(menu, 'FEEDBACK');
  const docsSection = findSection(menu, 'DOCUMENTS');
  const annSection = findSection(menu, 'ANNOUNCEMENT');
  const gallerySection = findSection(menu, 'GALLERY');
  const staffSection = findSection(menu, 'STAFF');
  const newsSection = findSection(menu, 'NEWS');
  const address = pick(locale, profile?.addressKk, profile?.addressRu);
  const head = pick(locale, profile?.headNameKk, profile?.headNameRu);
  // Портрет — настоящий, из карточки педагога: ищем заведующую по должности (имена в списке на языке сада).
  const headPhoto = staff.find((member) => member.photo && /заведующ|меңгеруші/i.test(`${member.positionRu ?? ''} ${member.positionKk ?? ''}`))?.photo ?? null;
  const mapHref = profile?.lat && profile?.lng ? `https://yandex.kz/maps/?pt=${profile.lng},${profile.lat}&z=17&l=map` : null;

  const tabs: { key: string; label: string; href: string }[] = [{ key: 'news', label: T.news[locale], href: `/${newsSection?.slug ?? 'news'}` }];
  if (annSection) tabs.push({ key: 'ann', label: T.announcements[locale], href: `/${annSection.slug}` });
  if (docsSection) tabs.push({ key: 'docs', label: T.documents[locale], href: `/${docsSection.slug}` });
  if (gallerySection) tabs.push({ key: 'gallery', label: T.gallery[locale], href: `/${gallerySection.slug}` });

  return (
    <div className="akorda-home">
      {slides.length > 0 ? (
        <section className="container-page akorda-top" aria-label={T.slider[locale]}>
          <div className="akorda-slider">
            {slides.map((post, index) => (
              <input
                key={post.id}
                type="radio"
                name="akorda-slide"
                id={`akorda-r${index}`}
                defaultChecked={index === 0}
                className="akorda-radio sr-only"
                aria-label={`${index + 1} / ${slides.length}`}
              />
            ))}
            <div className="akorda-slides">
              {slides.map((post, index) => {
                const cover = mediaUrl(post.coverMedia);
                const prev = (index - 1 + slides.length) % slides.length;
                const nextIndex = (index + 1) % slides.length;
                return (
                  <article key={post.id} className={`akorda-slide akorda-slide-${index}`}>
                    <SiteLink href={`/news/${post.slug}`} locale={locale} className="akorda-slide-pic">
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element -- медиа отдаёт свой роут
                        <img src={cover} alt={pick(locale, post.titleKk, post.titleRu)} loading={index === 0 ? 'eager' : 'lazy'} />
                      ) : (
                        <ThemeImage theme="akorda" name="hero" alt={pick(locale, post.titleKk, post.titleRu)} sizes="(min-width: 1024px) 66vw, 100vw" eager={index === 0} />
                      )}
                    </SiteLink>
                    <div className="akorda-slide-text">
                      <p className="akorda-date">{formatDate(post.publishedAt ?? post.createdAt, locale)}</p>
                      <h2 className="akorda-slide-title">
                        <SiteLink href={`/news/${post.slug}`} locale={locale}>{pick(locale, post.titleKk, post.titleRu)}</SiteLink>
                      </h2>
                      {slides.length > 1 ? (
                        <div className="akorda-arrows">
                          <label htmlFor={`akorda-r${prev}`} className="akorda-arrow" title={T.prev[locale]}><Arrow dir="left" /></label>
                          <span>{index + 1} / {slides.length}</span>
                          <label htmlFor={`akorda-r${nextIndex}`} className="akorda-arrow" title={T.next[locale]}><Arrow dir="right" /></label>
                        </div>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {tabs.length > 1 ? (
        <nav className="container-page akorda-tabs-wrap" aria-label={T.tabs[locale]}>
          <ul className="akorda-tabs">
            {tabs.map((tab, index) => (
              <li key={tab.key}>
                <SiteLink href={tab.href} locale={locale} className={index === 0 ? 'akorda-tab akorda-tab-active' : 'akorda-tab'}>
                  {tab.label}
                </SiteLink>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <section className="container-page akorda-main">
        <div className="akorda-main-grid">
          <div className="min-w-0">
            {feed.length > 0 ? (
              <>
                <h2 className="akorda-h1">{T.news[locale]}</h2>
                <hr className="akorda-hr" />
                {feed.slice(0, 7).map((post) => {
                  const cover = mediaUrl(post.coverMedia);
                  return (
                    <article key={post.id} className="akorda-row">
                      <SiteLink href={`/news/${post.slug}`} locale={locale} className="akorda-row-pic">
                        {cover ? (
                          // eslint-disable-next-line @next/next/no-img-element -- медиа отдаёт свой роут
                          <img src={cover} alt={pick(locale, post.titleKk, post.titleRu)} loading="lazy" />
                        ) : (
                          <ThemeImage theme="akorda" name="hero" alt={pick(locale, post.titleKk, post.titleRu)} sizes="(min-width: 1024px) 33vw, 100vw" />
                        )}
                      </SiteLink>
                      <div>
                        <h3 className="akorda-row-title">
                          <SiteLink href={`/news/${post.slug}`} locale={locale}>{pick(locale, post.titleKk, post.titleRu)}</SiteLink>
                        </h3>
                        <p className="akorda-date">{formatDate(post.publishedAt ?? post.createdAt, locale)}</p>
                      </div>
                    </article>
                  );
                })}
                <p className="akorda-more"><SiteLink href="/news" locale={locale} className="akorda-button">{T.allNews[locale]}</SiteLink></p>
              </>
            ) : null}
          </div>

          <aside className="akorda-side" aria-label={T.announcements[locale]}>
            {announcements.length > 0 ? (
              <section className="akorda-box akorda-orn" aria-labelledby="akorda-ann">
                <h2 id="akorda-ann" className="akorda-box-title">{T.announcements[locale]}</h2>
                <AnnouncementsList items={announcements} locale={locale} section={annSection} />
              </section>
            ) : null}
            {profile && (address || profile.phone || profile.workHours) ? (
              <section className="akorda-box" aria-labelledby="akorda-contacts">
                <h2 id="akorda-contacts" className="akorda-box-title">{T.contacts[locale]}</h2>
                <dl className="akorda-dl">
                  {address ? (<><dt>{T.address[locale]}</dt><dd>{address}</dd></>) : null}
                  {profile.phone ? (
                    <>
                      <dt>{T.phones[locale]}</dt>
                      <dd>
                        <a href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`}>{profile.phone}</a>
                        {profile.phoneExtra ? <span> · {profile.phoneExtra}</span> : null}
                      </dd>
                    </>
                  ) : null}
                  {profile.workHours ? (<><dt>{T.hours[locale]}</dt><dd>{profile.workHours}</dd></>) : null}
                </dl>
                {mapHref ? (
                  <a href={mapHref} target="_blank" rel="noopener noreferrer" className="akorda-link">
                    {T.map[locale]}<span className="sr-only"> ({T.newTab[locale]})</span>
                  </a>
                ) : null}
              </section>
            ) : null}
          </aside>
        </div>
      </section>

      {head ? (
        <section className="container-page akorda-lead" aria-labelledby="akorda-lead">
          <div className="akorda-lead-card">
            <div className="akorda-lead-pic">
              {headPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element -- медиа отдаёт свой роут
                <img src={mediaUrl(headPhoto)!} alt="" loading="lazy" />
              ) : coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- обложку отдаёт /api/media
                <img src={coverUrl} alt="" style={{ objectPosition: coverPosition }} loading="lazy" />
              ) : (
                <ThemeImage theme="akorda" name="hero" sizes="(min-width: 1024px) 50vw, 100vw" />
              )}
            </div>
            <div className="akorda-orn akorda-lead-text">
              <h2 id="akorda-lead" className="akorda-lead-title">{T.head[locale]}</h2>
              <p className="akorda-lead-name">{head}</p>
              {hero.lead ? <p className="akorda-lead-note">{hero.lead}</p> : null}
              <div className="akorda-lead-actions">
                {hero.buttons.length > 0 ? (
                  hero.buttons.slice(0, 2).map((link) => (
                    <LinkButton key={link.href} link={link} className="akorda-button" />
                  ))
                ) : reception ? (
                  <SiteLink href={`/${reception.slug}`} locale={locale} className="akorda-button">{T.reception[locale]}</SiteLink>
                ) : (
                  <EnrollLink menu={menu} locale={locale} className="akorda-button">{T.queue[locale]}</EnrollLink>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {groups.length > 0 ? (
        <section className="container-page akorda-block" aria-labelledby="akorda-groups">
          <h2 id="akorda-groups" className="akorda-h1">{T.groups[locale]}</h2>
          <hr className="akorda-hr" />
          <GroupCards groups={groups.slice(0, 4)} locale={locale} className="akorda-groups" />
        </section>
      ) : null}

      {staff.length > 0 ? (
        <section className="container-page akorda-block" aria-labelledby="akorda-staff">
          <h2 id="akorda-staff" className="akorda-h1">{T.staff[locale]}</h2>
          <hr className="akorda-hr" />
          <StaffCards staff={staff} locale={locale} limit={4} className="akorda-staff" />
          {staffSection ? <p className="akorda-more"><SiteLink href={`/${staffSection.slug}`} locale={locale} className="akorda-button">{T.allStaff[locale]}</SiteLink></p> : null}
        </section>
      ) : null}

      {documents.length > 0 ? (
        <section className="container-page akorda-block" aria-labelledby="akorda-docs">
          <h2 id="akorda-docs" className="akorda-h1">{T.documents[locale]}</h2>
          <hr className="akorda-hr" />
          <ul className="akorda-docs">
            {documents.slice(0, 6).map((doc) => (
              <li key={doc.id}>
                <DocLink doc={doc} locale={locale} className="akorda-doc-title">{pick(locale, doc.titleKk, doc.titleRu)}</DocLink>
                <span className="akorda-doc-meta">{docFormat(doc.media.mime)} · {formatSize(doc.media.size, locale)} · {formatDate(doc.publishedAt, locale)}</span>
              </li>
            ))}
          </ul>
          {docsSection ? <p className="akorda-more"><SiteLink href={`/${docsSection.slug}`} locale={locale} className="akorda-button">{T.allDocs[locale]}</SiteLink></p> : null}
        </section>
      ) : null}

      {photos.length > 0 ? (
        <section className="container-page akorda-block" aria-labelledby="akorda-photos">
          <h2 id="akorda-photos" className="akorda-h1">{T.gallery[locale]}</h2>
          <hr className="akorda-hr" />
          <LatestPhotos photos={photos} locale={locale} gallerySection={gallerySection} />
        </section>
      ) : null}
    </div>
  );
}
