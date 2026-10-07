import type { Section } from '@prisma/client';
import type { CSSProperties } from 'react';
import { SiteLink, mediaUrl } from '@/components/site/blocks';
import { HeroButtons, HeroTitle } from '@/components/site/Hero';
import { GroupCards, StaffCards } from '@/components/site/home-blocks';
import { AnnouncementsList, DocsTable, LatestPhotos } from '@/components/site/theme-blocks';
import { EnrollLink, ThemeImage, findSection } from '@/components/site/theme-kit';
import { pick } from '@/lib/i18n';
import { formatDate } from '@/lib/labels';
import type { HomeProps } from '@/templates/types';
import { Flag } from './Doodles';

const T = {
  door: { kk: 'Кіру', ru: 'Войти' },
  scroll: { kk: 'Төмен айналдырыңыз', ru: 'Листайте вниз' },
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
 * Главная «Үйшік — анимация» — тот же кукольный дом, что в «Үйшік», но первый
 * экран — сцена-«ролик», которой управляет прокрутка (см. разметку ниже).
 * Сад как кукольный дом в разрезе. Разделы сайта —
 * комнаты: нажал на комнату — вошёл в раздел; при наведении и фокусе
 * в комнате «включается свет». Над домом — крыша с названием, под ним
 * дверь «записаться». Во дворе: новости висят на бельевой верёвке,
 * объявления — на указателе, фото — карточки-«полароиды», группы —
 * бумажные домики, педагоги — портреты в рамках. Комнат ровно столько,
 * сколько у сада разделов; нет раздела — нет комнаты.
 */
export function UyshikAnimHome({
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
    <div className="uyshik-anim-home">
      {/* Сцена-«ролик»: в браузерах с анимациями по прокрутке (CSS
          animation-timeline) сцена залипает на экран, и прокрутка ведёт
          камеру: облака расходятся, солнце встаёт, деревья раздвигаются,
          потом камера едет вниз по дому, и в комнатах по очереди
          загорается свет. Без поддержки, на телефоне и при «меньше
          движения» — тот же пейзаж неподвижно. */}
      <section className="uyshik-anim-stage" style={{ '--uyshik-anim-rooms': rooms.length } as CSSProperties}>
        <div className="uyshik-anim-scene">
          <div className="uyshik-anim-layers decor" aria-hidden>
            <span className="uyshik-anim-sky" />
            <ThemeImage theme="uyshik-anim" name="sun" className="uyshik-anim-sun" sizes="20vw" eager />
            <ThemeImage theme="uyshik-anim" name="cloud-a" className="uyshik-anim-cloud uyshik-anim-cloud-a" sizes="30vw" eager />
            <ThemeImage theme="uyshik-anim" name="cloud-b" className="uyshik-anim-cloud uyshik-anim-cloud-b" sizes="30vw" eager />
            <ThemeImage theme="uyshik-anim" name="cloud-a" className="uyshik-anim-cloud uyshik-anim-cloud-c" sizes="20vw" />
            <ThemeImage theme="uyshik-anim" name="hills" className="uyshik-anim-hills" sizes="100vw" eager />
            <ThemeImage theme="uyshik-anim" name="trees-left" className="uyshik-anim-trees uyshik-anim-trees-left" sizes="30vw" eager />
            <ThemeImage theme="uyshik-anim" name="trees-right" className="uyshik-anim-trees uyshik-anim-trees-right" sizes="30vw" eager />
            <ThemeImage theme="uyshik-anim" name="meadow" className="uyshik-anim-meadow" sizes="100vw" eager />
          </div>
          <div className="container-page uyshik-anim-building">
            <div className="uyshik-anim-house">
              <div className="uyshik-anim-roof">
                <span className="uyshik-anim-chimney decor" aria-hidden />
                <Flag className="uyshik-anim-flag" />
                <HeroTitle hero={hero} tone="plain" className="uyshik-anim-h1" withEyebrow={false} />
                {hero.lead ? <p className="uyshik-anim-lead">{hero.lead}</p> : null}
                {hero.buttons.length > 0 ? (
                  <div className="uyshik-anim-roof-actions">
                    <HeroButtons hero={hero} tone="light" />
                  </div>
                ) : null}
              </div>
              {rooms.length > 0 ? (
                <ul className="uyshik-anim-rooms" aria-label={T.rooms[locale]}>
                  {rooms.map(({ section, scene }, index) => (
                    <li key={section.id}>
                      <SiteLink href={`/${section.slug}`} locale={locale} className={`uyshik-anim-room uyshik-anim-wall-${index % 4}`}>
                        <ThemeImage theme="uyshik" name={`room-${scene}`} className="uyshik-anim-room-img" sizes="(min-width: 768px) 20rem, 45vw" eager={index < 3} />
                        <span className="uyshik-anim-sign">{pick(locale, section.titleKk, section.titleRu)}<span aria-hidden> →</span></span>
                      </SiteLink>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <div className="uyshik-anim-ground">
              <EnrollLink menu={menu} locale={locale} className="uyshik-anim-door">
                <span className="uyshik-anim-door-label">{reception ? T.door[locale] : T.doorHint[locale]}</span>
                <span className="uyshik-anim-door-knob" aria-hidden />
                <span className="sr-only"> — {T.doorHint[locale]}</span>
              </EnrollLink>
            </div>
          </div>
          <p className="uyshik-anim-hint decor" aria-hidden>{T.scroll[locale]}</p>
        </div>
      </section>

      <section className="uyshik-anim-yard">
        {feed.length > 0 ? (
          <div className="container-page uyshik-anim-block" aria-labelledby="uyshik-anim-news">
            <div className="uyshik-anim-title-row">
              <h2 id="uyshik-anim-news" className="uyshik-anim-title">{T.line[locale]}</h2>
              <SiteLink href="/news" locale={locale} className="uyshik-anim-link">{T.allNews[locale]}</SiteLink>
            </div>
            <div className="uyshik-anim-line" aria-hidden />
            <ul className="uyshik-anim-flags">
              {feed.slice(0, 5).map((post) => {
                const cover = mediaUrl(post.coverMedia);
                return (
                  <li key={post.id} className="uyshik-anim-flag-item">
                    <SiteLink href={`/news/${post.slug}`} locale={locale} className="uyshik-anim-paper">
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element -- медиа отдаёт свой роут
                        <img src={cover} alt="" className="uyshik-anim-paper-img" loading="lazy" />
                      ) : (
                        <ThemeImage theme="uyshik" name="room-group" className="uyshik-anim-paper-img" sizes="(min-width: 1024px) 18vw, 60vw" />
                      )}
                      <span className="uyshik-anim-paper-date">{formatDate(post.publishedAt ?? post.createdAt, locale)}</span>
                      <span className="uyshik-anim-paper-title">{pick(locale, post.titleKk, post.titleRu)}</span>
                    </SiteLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {announcements.length > 0 || photos.length > 0 ? (
          <div className="container-page uyshik-anim-block uyshik-anim-duo">
            {announcements.length > 0 ? (
              <section aria-labelledby="uyshik-anim-post" className="uyshik-anim-post-wrap">
                <h2 id="uyshik-anim-post" className="uyshik-anim-title">{T.post[locale]}</h2>
                <div className="uyshik-anim-post">
                  <AnnouncementsList items={announcements} locale={locale} section={annSection} />
                </div>
              </section>
            ) : null}
            {photos.length > 0 ? (
              <section aria-labelledby="uyshik-anim-photos" className="min-w-0">
                <h2 id="uyshik-anim-photos" className="uyshik-anim-title">{T.photos[locale]}</h2>
                <div className="uyshik-anim-polaroids">
                  <LatestPhotos photos={photos} locale={locale} gallerySection={gallerySection} />
                </div>
              </section>
            ) : null}
          </div>
        ) : null}

        {groups.length > 0 ? (
          <div className="container-page uyshik-anim-block" aria-labelledby="uyshik-anim-groups">
            <h2 id="uyshik-anim-groups" className="uyshik-anim-title">{T.groups[locale]}</h2>
            <GroupCards groups={groups.slice(0, 4)} locale={locale} className="uyshik-anim-groups" />
          </div>
        ) : null}

        {staff.length > 0 ? (
          <div className="container-page uyshik-anim-block" aria-labelledby="uyshik-anim-staff">
            <div className="uyshik-anim-title-row">
              <h2 id="uyshik-anim-staff" className="uyshik-anim-title">{T.staff[locale]}</h2>
              {staffSection ? <SiteLink href={`/${staffSection.slug}`} locale={locale} className="uyshik-anim-link">{T.allStaff[locale]}</SiteLink> : null}
            </div>
            <StaffCards staff={staff} locale={locale} limit={4} className="uyshik-anim-staff" />
          </div>
        ) : null}

        {documents.length > 0 ? (
          <div className="container-page uyshik-anim-block" aria-labelledby="uyshik-anim-docs">
            <h2 id="uyshik-anim-docs" className="uyshik-anim-title">{T.docs[locale]}</h2>
            <DocsTable documents={documents} locale={locale} docsSection={docsSection} />
          </div>
        ) : null}
      </section>
      <div className="uyshik-anim-soil" aria-hidden />
    </div>
  );
}
