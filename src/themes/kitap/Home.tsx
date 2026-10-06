import type { CSSProperties } from 'react';
import { SiteLink, mediaUrl } from '@/components/site/blocks';
import { HeroButtons, HeroTitle } from '@/components/site/Hero';
import { GroupCards, StaffCards, StatsRow } from '@/components/site/home-blocks';
import { AnnouncementsList, DocLink, LatestPhotos, docFormat } from '@/components/site/theme-blocks';
import { EnrollLink, ThemeImage, aboutSection, findSection } from '@/components/site/theme-kit';
import { formatSize } from '@/lib/file-cards';
import { homeStats } from '@/lib/home-stats';
import { pick } from '@/lib/i18n';
import { formatAgeRange, formatDate } from '@/lib/labels';
import type { HomeProps } from '@/templates/types';
import { Badge } from './Doodles';

const T = {
  badge: { kk: 'Жазылу ашық', ru: 'Запись открыта' },
  about: { kk: 'Біз туралы', ru: 'О нас' },
  more: { kk: 'Толығырақ', ru: 'Подробнее' },
  news: { kk: 'Жаңалықтар', ru: 'Новости' },
  rail: { kk: 'Жаңалықтар таспасы, оңға сырғытыңыз', ru: 'Лента новостей, прокрутите вправо' },
  announcements: { kk: 'Хабарландырулар', ru: 'Объявления' },
  photos: { kk: 'Суреттер', ru: 'Фото' },
  groups: { kk: 'Топтар', ru: 'Группы' },
  staff: { kk: 'Педагогтар', ru: 'Педагоги' },
  allStaff: { kk: 'Барлығы', ru: 'Все педагоги' },
  docs: { kk: 'Мазмұны', ru: 'Оглавление' },
  docsNote: { kk: 'Құжаттар', ru: 'Документы сада' },
  allDocs: { kk: 'Барлық құжаттар', ru: 'Все документы' },
  download: { kk: 'Жүктеп алу', ru: 'Скачать' },
  visit: { kk: 'Қоңырау шалыңыз', ru: 'Позвоните нам' },
  place: { kk: 'Мекенжай', ru: 'Адрес' },
  yard: { kk: 'Біздің аула', ru: 'Наш двор' },
} as const;

const TONES = ['kitap-yellow', 'kitap-pink', 'kitap-blue'];

/**
 * Главная «Кітап» («Книга-афиша») — типографика вместо карточек. Каждый
 * блок — отдельный «разворот» на всю ширину и свой цвет: обложка с гигантским
 * словом и вращающейся печатью «запись открыта», бегущая строка с группами,
 * «о нас» одной громадной фразой и цифры, лента новостей по горизонтали
 * (её можно листать и с клавиатуры), группы и педагоги списком-афишей,
 * документы оглавлением с точками, финал — телефон во весь экран.
 * Рисунки вырезаны из бумаги — сгенерированы; тексты и данные — сада.
 */
export function KitapHome({
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
  counts,
}: HomeProps) {
  const feed = (newsFeed ?? news).slice(0, 7);
  const stats = homeStats(profile, counts, locale);
  const about = aboutSection(menu);
  const annSection = findSection(menu, 'ANNOUNCEMENT');
  const docsSection = findSection(menu, 'DOCUMENTS');
  const gallerySection = findSection(menu, 'GALLERY');
  const staffSection = findSection(menu, 'STAFF');
  const aboutText = pick(locale, profile?.aboutKk, profile?.aboutRu);
  const name = pick(locale, profile?.shortNameKk || profile?.nameKk, profile?.shortNameRu || profile?.nameRu) || 'Балабақша';
  const address = pick(locale, profile?.addressKk, profile?.addressRu);
  const tel = profile?.phone ? `tel:${profile.phone.replace(/[^\d+]/g, '')}` : null;
  // Обложка набрана во всю колонку, и длинное название («БАЛДЫРҒАН») рвалось
  // посреди слова. Размер шрифта подгоняется под самое длинное слово.
  const longestWord = Math.max(6, ...`${hero.title} ${hero.highlight ?? ''}`.split(/\s+/).map((word) => word.length));
  const ticker = groups.length > 0
    ? groups.map((group) => `${pick(locale, group.nameKk, group.nameRu)} · ${formatAgeRange(group.ageFrom, group.ageTo, locale) ?? ''}`.replace(/ · $/, ''))
    : [name, address].filter(Boolean);

  return (
    <div className="kitap-home">
      <section className="kitap-cover">
        <div className="container-page kitap-cover-grid">
          <div className="kitap-cover-text" style={{ '--kitap-word': longestWord } as CSSProperties}>
            <HeroTitle hero={hero} tone="light" className="kitap-h1" withEyebrow={false} />
            {hero.lead ? <p className="kitap-lead">{hero.lead}</p> : null}
            <div className="kitap-cover-actions">
              <HeroButtons hero={hero} tone="light">
                <EnrollLink menu={menu} locale={locale} className="kitap-btn" />
              </HeroButtons>
            </div>
          </div>
          <div className="kitap-art">
            <ThemeImage theme="kitap" name="cover" className="kitap-art-img" sizes="(min-width: 1024px) 40vw, 90vw" eager />
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- обложку отдаёт /api/media
              <img src={coverUrl} alt={T.yard[locale]} style={{ objectPosition: coverPosition }} className="kitap-print" loading="eager" />
            ) : null}
            <EnrollLink menu={menu} locale={locale} className="kitap-seal">
              <Badge text={T.badge[locale]} />
              <span className="sr-only">{T.badge[locale]}</span>
            </EnrollLink>
          </div>
        </div>
      </section>

      <div className="kitap-marquee" aria-hidden>
        <div className="kitap-marquee-track">
          {[0, 1].map((copy) => (
            <ul key={copy} className="kitap-marquee-set">
              {ticker.concat(ticker).map((item, index) => (
                <li key={`${copy}-${index}`}>{item}</li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      {aboutText || stats.length > 0 ? (
        <section className="kitap-about" aria-labelledby="kitap-about">
          <div className="container-page kitap-about-grid">
            <h2 id="kitap-about" className="kitap-label">{T.about[locale]}</h2>
            <div className="min-w-0">
              {aboutText ? <p className="kitap-statement">{aboutText}</p> : null}
              {about ? <SiteLink href={`/${about.slug}`} locale={locale} className="kitap-link">{T.more[locale]}</SiteLink> : null}
              <StatsRow stats={stats} className="kitap-stats" />
            </div>
          </div>
        </section>
      ) : null}

      {feed.length > 0 ? (
        <section className="kitap-news" aria-labelledby="kitap-news">
          <div className="container-page kitap-head">
            <h2 id="kitap-news" className="kitap-big">{T.news[locale]}</h2>
            <SiteLink href="/news" locale={locale} className="kitap-link">{T.more[locale]} →</SiteLink>
          </div>
          <div className="kitap-rail" tabIndex={0} role="region" aria-label={T.rail[locale]}>
            <ul className="kitap-track">
              {feed.slice(0, 7).map((post, index) => {
              const cover = mediaUrl(post.coverMedia);
              return (
                <li key={post.id} className={`kitap-slide ${TONES[index % 3]}`}>
                  <SiteLink href={`/news/${post.slug}`} locale={locale} className="kitap-card">
                    <span className="kitap-card-pic">
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element -- медиа отдаёт свой роут
                        <img src={cover} alt="" loading="lazy" />
                      ) : null}
                    </span>
                    <span className="kitap-card-date">{formatDate(post.publishedAt ?? post.createdAt, locale)}</span>
                    <span className="kitap-card-title">{pick(locale, post.titleKk, post.titleRu)}</span>
                  </SiteLink>
                </li>
              );
              })}
            </ul>
          </div>
        </section>
      ) : null}

      {announcements.length > 0 ? (
        <section className="kitap-notice" aria-labelledby="kitap-ann">
          <div className="container-page kitap-notice-grid">
            <h2 id="kitap-ann" className="kitap-label kitap-label-light">{T.announcements[locale]}</h2>
            <AnnouncementsList items={announcements} locale={locale} section={annSection} />
          </div>
        </section>
      ) : null}

      {photos.length > 0 ? (
        <section className="kitap-photos" aria-labelledby="kitap-photos">
          <h2 id="kitap-photos" className="sr-only">{T.photos[locale]}</h2>
          <LatestPhotos photos={photos} locale={locale} gallerySection={gallerySection} />
        </section>
      ) : null}

      {groups.length > 0 ? (
        <section className="kitap-lineup" aria-labelledby="kitap-groups">
          <div className="container-page">
            <h2 id="kitap-groups" className="kitap-big">{T.groups[locale]}</h2>
            <GroupCards groups={groups.slice(0, 6)} locale={locale} className="kitap-groups" />
          </div>
        </section>
      ) : null}

      {staff.length > 0 ? (
        <section className="kitap-cast" aria-labelledby="kitap-staff">
          <div className="container-page">
            <div className="kitap-head">
              <h2 id="kitap-staff" className="kitap-big">{T.staff[locale]}</h2>
              {staffSection ? <SiteLink href={`/${staffSection.slug}`} locale={locale} className="kitap-link">{T.allStaff[locale]} →</SiteLink> : null}
            </div>
            <StaffCards staff={staff} locale={locale} limit={6} className="kitap-staff" />
          </div>
        </section>
      ) : null}

      {documents.length > 0 ? (
        <section className="kitap-contents" aria-labelledby="kitap-docs">
          <div className="container-page">
            <div className="kitap-head">
              <h2 id="kitap-docs" className="kitap-big">{T.docs[locale]}</h2>
              <p className="kitap-note">{T.docsNote[locale]}</p>
            </div>
            <ul className="kitap-toc">
              {documents.slice(0, 6).map((doc) => (
                <li key={doc.id}>
                  <DocLink doc={doc} locale={locale} className="kitap-toc-title">{pick(locale, doc.titleKk, doc.titleRu)}</DocLink>
                  <span className="kitap-toc-dots" aria-hidden />
                  <span className="kitap-toc-meta">{docFormat(doc.media.mime)} · {formatSize(doc.media.size, locale)} · {formatDate(doc.publishedAt, locale)}</span>
                  <a href={`/api/media/${doc.mediaId}?download=1`} download className="kitap-toc-dl">
                    {T.download[locale]}
                    <span className="sr-only">: {pick(locale, doc.titleKk, doc.titleRu)}</span>
                  </a>
                </li>
              ))}
            </ul>
            {docsSection ? <p className="mt-6"><SiteLink href={`/${docsSection.slug}`} locale={locale} className="kitap-link">{T.allDocs[locale]} →</SiteLink></p> : null}
          </div>
        </section>
      ) : null}

      <div className="kitap-band decor" aria-hidden>
        <ThemeImage theme="kitap" name="kids" className="kitap-band-img" sizes="100vw" />
      </div>

      <section className="kitap-final" aria-labelledby="kitap-final">
        <div className="container-page">
          <h2 id="kitap-final" className="kitap-label">{T.visit[locale]}</h2>
          {profile?.phone && tel ? <a href={tel} className="kitap-phone">{profile.phone}</a> : <p className="kitap-phone">{name}</p>}
          {address ? <p className="kitap-address"><span>{T.place[locale]}:</span> {address}</p> : null}
          <EnrollLink menu={menu} locale={locale} className="kitap-btn kitap-btn-ink" />
        </div>
      </section>
    </div>
  );
}
