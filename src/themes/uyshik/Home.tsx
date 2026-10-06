import type { Section } from '@prisma/client';
import { SiteLink, mediaUrl } from '@/components/site/blocks';
import { HeroButtons, HeroTitle } from '@/components/site/Hero';
import { GroupCards, StaffCards } from '@/components/site/home-blocks';
import { AnnouncementsList, DocsTable, LatestPhotos } from '@/components/site/theme-blocks';
import { EnrollLink, ThemeImage, findSection } from '@/components/site/theme-kit';
import { pick } from '@/lib/i18n';
import { formatDate } from '@/lib/labels';
import type { HomeProps } from '@/templates/types';
import { Cloud, Flag, Sun } from './Doodles';

const T = {
  door: { kk: 'Кіру', ru: 'Войти' },
  doorHint: { kk: 'Экскурсияға жазылу', ru: 'Записаться на экскурсию' },
  line: { kk: 'Жаңалықтар', ru: 'Новости' },
  allNews: { kk: 'Барлық жаңалықтар', ru: 'Все новости' },
  post: { kk: 'Хабарландырулар', ru: 'Объявления' },
  photos: { kk: 'Суреттер', ru: 'Фотографии' },
  groups: { kk: 'Топтар', ru: 'Группы' },
  staff: { kk: 'Тәрбиешілер', ru: 'Педагоги' },
  allStaff: { kk: 'Барлығы', ru: 'Все педагоги' },
  docs: { kk: 'Құжаттар', ru: 'Документы' },
  rooms: { kk: 'Балабақша бөлмелері', ru: 'Комнаты детского сада' },
} as const;

type Scene = 'group' | 'kitchen' | 'music' | 'library' | 'studio' | 'office' | 'gym' | 'hall';

/** Какая комната рисуется к какому разделу; повтор заменяется первой свободной. */
const SCENE_FOR: Partial<Record<Section['type'], Scene>> = {
  PAGE: 'hall',
  GROUPS: 'group',
  MENU_FOOD: 'kitchen',
  CLUBS: 'music',
  GALLERY: 'studio',
  DOCUMENTS: 'library',
  STAFF: 'office',
  FEEDBACK: 'office',
  CONTACTS: 'hall',
  FAQ: 'library',
  TRUSTEE_BOARD: 'office',
  ANTICORRUPTION: 'office',
};

const SPARE: Scene[] = ['gym', 'hall', 'library', 'office', 'studio', 'music', 'kitchen', 'group'];
const NOT_ROOMS: Section['type'][] = ['NEWS', 'ANNOUNCEMENT', 'LINK', 'REVIEWS', 'PRICES', 'VACANCIES'];

function roomsFor(menu: Section[] | undefined): { section: Section; scene: Scene }[] {
  const used = new Set<Scene>();
  const rooms: { section: Section; scene: Scene }[] = [];
  for (const section of menu ?? []) {
    if (NOT_ROOMS.includes(section.type) || rooms.length >= 8) continue;
    const wanted = SCENE_FOR[section.type];
    const scene = wanted && !used.has(wanted) ? wanted : (SPARE.find((item) => !used.has(item)) ?? 'hall');
    used.add(scene);
    rooms.push({ section, scene });
  }
  return rooms;
}

/**
 * Главная «Үйшік» («Домик») — сад как кукольный дом в разрезе. Разделы сайта —
 * комнаты: нажал на комнату — вошёл в раздел; при наведении и фокусе
 * в комнате «включается свет». Над домом — крыша с названием, под ним
 * дверь «записаться». Во дворе: новости висят на бельевой верёвке,
 * объявления — на указателе, фото — карточки-«полароиды», группы —
 * бумажные домики, педагоги — портреты в рамках. Комнат ровно столько,
 * сколько у сада разделов; нет раздела — нет комнаты.
 */
export function UyshikHome({
  news,
  newsFeed,
  announcements = [],
  documents = [],
  photos = [],
  groups = [],
  staff = [],
  locale,
  hero,
  menu,
}: HomeProps) {
  const rooms = roomsFor(menu);
  const feed = (newsFeed ?? news).slice(0, 5);
  const annSection = findSection(menu, 'ANNOUNCEMENT');
  const docsSection = findSection(menu, 'DOCUMENTS');
  const gallerySection = findSection(menu, 'GALLERY');
  const staffSection = findSection(menu, 'STAFF');
  const reception = findSection(menu, 'FEEDBACK');

  return (
    <div className="uyshik-home">
      <section className="uyshik-scene">
        <Sun className="uyshik-sun" />
        <Cloud className="uyshik-cloud uyshik-cloud-a" />
        <Cloud className="uyshik-cloud uyshik-cloud-b" />
        <div className="container-page">
          <div className="uyshik-house">
            <div className="uyshik-roof">
              <span className="uyshik-chimney decor" aria-hidden />
              <Flag className="uyshik-flag" />
              <HeroTitle hero={hero} tone="light" className="uyshik-h1" withEyebrow={false} />
              {hero.lead ? <p className="uyshik-lead">{hero.lead}</p> : null}
              {hero.buttons.length > 0 ? (
                <div className="uyshik-roof-actions">
                  <HeroButtons hero={hero} tone="light" />
                </div>
              ) : null}
            </div>
            {rooms.length > 0 ? (
              <ul className="uyshik-rooms" aria-label={T.rooms[locale]}>
                {rooms.map(({ section, scene }, index) => (
                  <li key={section.id}>
                    <SiteLink href={`/${section.slug}`} locale={locale} className={`uyshik-room uyshik-wall-${index % 4}`}>
                      <ThemeImage theme="uyshik" name={`room-${scene}`} className="uyshik-room-img" sizes="(min-width: 768px) 20rem, 45vw" eager={index < 3} />
                      <span className="uyshik-sign">{pick(locale, section.titleKk, section.titleRu)}<span aria-hidden> →</span></span>
                    </SiteLink>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="uyshik-ground">
            <EnrollLink menu={menu} locale={locale} className="uyshik-door">
              <span className="uyshik-door-label">{reception ? T.door[locale] : T.doorHint[locale]}</span>
              <span className="uyshik-door-knob" aria-hidden />
              <span className="sr-only"> — {T.doorHint[locale]}</span>
            </EnrollLink>
          </div>
        </div>
      </section>

      <section className="uyshik-yard">
        {feed.length > 0 ? (
          <div className="container-page uyshik-block" aria-labelledby="uyshik-news">
            <div className="uyshik-title-row">
              <h2 id="uyshik-news" className="uyshik-title">{T.line[locale]}</h2>
              <SiteLink href="/news" locale={locale} className="uyshik-link">{T.allNews[locale]}</SiteLink>
            </div>
            <div className="uyshik-line" aria-hidden />
            <ul className="uyshik-flags">
              {feed.slice(0, 5).map((post) => {
                const cover = mediaUrl(post.coverMedia);
                return (
                  <li key={post.id} className="uyshik-flag-item">
                    <SiteLink href={`/news/${post.slug}`} locale={locale} className="uyshik-paper">
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element -- медиа отдаёт свой роут
                        <img src={cover} alt="" className="uyshik-paper-img" loading="lazy" />
                      ) : (
                        <ThemeImage theme="uyshik" name="room-group" className="uyshik-paper-img" sizes="(min-width: 1024px) 18vw, 60vw" />
                      )}
                      <span className="uyshik-paper-date">{formatDate(post.publishedAt ?? post.createdAt, locale)}</span>
                      <span className="uyshik-paper-title">{pick(locale, post.titleKk, post.titleRu)}</span>
                    </SiteLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {announcements.length > 0 || photos.length > 0 ? (
          <div className="container-page uyshik-block uyshik-duo">
            {announcements.length > 0 ? (
              <section aria-labelledby="uyshik-post" className="uyshik-post-wrap">
                <h2 id="uyshik-post" className="uyshik-title">{T.post[locale]}</h2>
                <div className="uyshik-post">
                  <AnnouncementsList items={announcements} locale={locale} section={annSection} />
                </div>
              </section>
            ) : null}
            {photos.length > 0 ? (
              <section aria-labelledby="uyshik-photos" className="min-w-0">
                <h2 id="uyshik-photos" className="uyshik-title">{T.photos[locale]}</h2>
                <div className="uyshik-polaroids">
                  <LatestPhotos photos={photos} locale={locale} gallerySection={gallerySection} />
                </div>
              </section>
            ) : null}
          </div>
        ) : null}

        {groups.length > 0 ? (
          <div className="container-page uyshik-block" aria-labelledby="uyshik-groups">
            <h2 id="uyshik-groups" className="uyshik-title">{T.groups[locale]}</h2>
            <GroupCards groups={groups.slice(0, 4)} locale={locale} className="uyshik-groups" />
          </div>
        ) : null}

        {staff.length > 0 ? (
          <div className="container-page uyshik-block" aria-labelledby="uyshik-staff">
            <div className="uyshik-title-row">
              <h2 id="uyshik-staff" className="uyshik-title">{T.staff[locale]}</h2>
              {staffSection ? <SiteLink href={`/${staffSection.slug}`} locale={locale} className="uyshik-link">{T.allStaff[locale]}</SiteLink> : null}
            </div>
            <StaffCards staff={staff} locale={locale} limit={4} className="uyshik-staff" />
          </div>
        ) : null}

        {documents.length > 0 ? (
          <div className="container-page uyshik-block" aria-labelledby="uyshik-docs">
            <h2 id="uyshik-docs" className="uyshik-title">{T.docs[locale]}</h2>
            <DocsTable documents={documents} locale={locale} docsSection={docsSection} />
          </div>
        ) : null}
      </section>
      <div className="uyshik-soil" aria-hidden />
    </div>
  );
}
