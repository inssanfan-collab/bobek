import type { ReactNode } from 'react';
import { GalleryStrip, SiteLink, T as BLOCK_T, mediaUrl } from '@/components/site/blocks';
import { formatSize } from '@/lib/file-cards';
import { pick, type Locale } from '@/lib/i18n';
import { formatDate } from '@/lib/labels';
import { isOfficeDoc } from '@/lib/media-kind';
import type { DocumentWithMedia, HomeProps } from '@/templates/types';

const T = {
  mainNews: { kk: 'Басты жаңалықтар', ru: 'Главные новости' },
  latest: { kk: 'Соңғы жаңалықтар', ru: 'Последние новости' },
  more: { kk: 'Толығырақ', ru: 'Подробнее' },
  important: { kk: 'Маңызды', ru: 'Важно' },
  queue: { kk: 'Балабақшаға кезек (Darabala.kz)', ru: 'Очередь в детский сад (Darabala.kz)' },
  egov: { kk: 'Мемлекеттік қызметтер (eGov.kz)', ru: 'Государственные услуги (eGov.kz)' },
  newTab: { kk: 'жаңа терезеде ашылады', ru: 'откроется в новой вкладке' },
  docs: { kk: 'Соңғы құжаттар', ru: 'Последние документы' },
  allDocs: { kk: 'Барлық құжаттар', ru: 'Все документы' },
  docTitle: { kk: 'Құжат атауы', ru: 'Название документа' },
  docDate: { kk: 'Күні', ru: 'Дата' },
  docSize: { kk: 'Пішімі мен көлемі', ru: 'Формат и размер' },
  download: { kk: 'Жүктеп алу', ru: 'Скачать' },
  head: { kk: 'Меңгеруші', ru: 'Заведующая' },
  leadership: { kk: 'Басшылық', ru: 'Руководство' },
  contacts: { kk: 'Байланыс', ru: 'Контакты' },
  address: { kk: 'Мекенжай', ru: 'Адрес' },
  phones: { kk: 'Телефондар', ru: 'Телефоны' },
  hours: { kk: 'Жұмыс кестесі', ru: 'Режим работы' },
  map: { kk: 'Картадан қарау', ru: 'Посмотреть на карте' },
  about: { kk: 'Біз туралы', ru: 'О нас' },
} as const;

/** Разделы, которые встают в колонку «Важно», в этом порядке — если сад их включил. */
const IMPORTANT_TYPES = ['FEEDBACK', 'ANTICORRUPTION', 'VACANCIES', 'DOCUMENTS', 'TRUSTEE_BOARD', 'MENU_FOOD', 'FAQ'] as const;

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

const ICON: Record<string, string> = {
  queue: 'M8 7a3 3 0 1 0 6 0 3 3 0 0 0-6 0M5 20c0-3.3 2.7-6 6-6s6 2.7 6 6M17 11h4m-2-2v4',
  egov: 'M3 10h18M5 10v8m4-8v8m6-8v8m4-8v8M3 21h18M12 3 3 8h18Z',
  FEEDBACK: 'M4 5h16v11H8l-4 4Z',
  ANTICORRUPTION: 'M12 3 4 6v6c0 4.4 3.4 8.2 8 9 4.6-.8 8-4.6 8-9V6Z',
  VACANCIES: 'M4 8h16v11H4zM9 8V5h6v3',
  DOCUMENTS: 'M6 3h8l4 4v14H6zM14 3v4h4',
  TRUSTEE_BOARD: 'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6m8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6M2 20c0-3 2.7-5 6-5s6 2 6 5m-1.5-4.6c1-.3 2.2-.4 3.5-.4 3.3 0 6 2 6 5',
  MENU_FOOD: 'M7 3v8m-3-8v5a3 3 0 0 0 6 0V3M7 11v10m10-18c-2 0-3 2-3 6s1 5 3 5v7',
  FAQ: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18m-2.5-11.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14m0 3h.01',
};

function docFormat(mime: string): string {
  if (mime === 'application/pdf') return 'PDF';
  if (mime.includes('word')) return 'DOC';
  if (mime.includes('sheet') || mime.includes('excel')) return 'XLS';
  if (mime.startsWith('image/')) return mime.slice(6).toUpperCase();
  return 'FILE';
}

/** Ссылка на документ: Word и Excel открывает просмотрщик /doc, остальное браузер показывает сам. */
function DocLink({ doc, locale, className, children }: { doc: DocumentWithMedia; locale: Locale; className?: string; children: ReactNode }) {
  return isOfficeDoc(doc.media.mime) ? (
    <SiteLink href={`/doc/${doc.id}`} locale={locale} className={className}>{children}</SiteLink>
  ) : (
    <a href={`/api/media/${doc.mediaId}`} target="_blank" rel="noopener" className={className}>{children}</a>
  );
}

/**
 * Главная «Ресми» — как у сайта государственной организации (макет
 * из Stitch): главная новость и ещё две слева, лента последних новостей или
 * объявлений в середине, «Важно» справа; ниже — последние документы
 * таблицей, альбомы, руководство и контакты. Всё — из данных сада:
 * нет документов или заведующей в паспорте — блок не показывается.
 */
export function ResmiHome({ profile, news, announcements, albums, locale, documents = [], menu = [], hero }: HomeProps) {
  const [featured, ...rest] = news;
  const cards = rest.slice(0, 2);
  const feedItems = announcements.length > 0 ? announcements : rest.slice(2);
  const feedBase = announcements.length > 0 ? '/announcements' : '/news';
  const feedTitle = announcements.length > 0 ? BLOCK_T.announcements[locale] : T.latest[locale];
  const important = IMPORTANT_TYPES.flatMap((type) => menu.filter((section) => section.type === type).slice(0, 1));
  const docsSection = menu.find((section) => section.type === 'DOCUMENTS');
  const address = pick(locale, profile?.addressKk, profile?.addressRu);
  const head = pick(locale, profile?.headNameKk, profile?.headNameRu);
  const mapHref = profile?.lat && profile?.lng ? `https://yandex.kz/maps/?pt=${profile.lng},${profile.lat}&z=17&l=map` : null;

  return (
    <div className="resmi-home container-page space-y-10 py-8">
      <div className={`grid gap-6 ${feedItems.length > 0 ? 'lg:grid-cols-[minmax(0,1fr)_17rem_16rem]' : 'lg:grid-cols-[minmax(0,1fr)_16rem]'}`}>
        <section aria-labelledby="resmi-main-news" className="min-w-0">
          <div className="resmi-section-head">
            <h2 id="resmi-main-news">{featured ? T.mainNews[locale] : T.about[locale]}</h2>
            {featured ? <SiteLink href="/news" locale={locale} className="resmi-more">{BLOCK_T.allNews[locale]} →</SiteLink> : null}
          </div>
          {featured ? (
            <>
              <article className="resmi-card resmi-featured">
                {mediaUrl(featured.coverMedia) ? (
                  // eslint-disable-next-line @next/next/no-img-element -- медиа отдаёт свой роут
                  <img src={mediaUrl(featured.coverMedia)!} alt="" className="resmi-featured-img" />
                ) : null}
                <div className="p-5 sm:p-6">
                  <p className="resmi-date">{formatDate(featured.publishedAt ?? featured.createdAt, locale)}</p>
                  <h3 className="resmi-featured-title">
                    <SiteLink href={`/news/${featured.slug}`} locale={locale}>{pick(locale, featured.titleKk, featured.titleRu)}</SiteLink>
                  </h3>
                  {pick(locale, featured.excerptKk, featured.excerptRu) ? (
                    <p className="resmi-excerpt">{pick(locale, featured.excerptKk, featured.excerptRu)}</p>
                  ) : null}
                </div>
              </article>
              {cards.length > 0 ? (
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  {cards.map((post) => (
                    <article key={post.id} className="resmi-card overflow-hidden">
                      {mediaUrl(post.coverMedia) ? (
                        // eslint-disable-next-line @next/next/no-img-element -- медиа отдаёт свой роут
                        <img src={mediaUrl(post.coverMedia)!} alt="" className="h-40 w-full object-cover" loading="lazy" />
                      ) : null}
                      <div className="p-4">
                        <p className="resmi-date">{formatDate(post.publishedAt ?? post.createdAt, locale)}</p>
                        <h3 className="resmi-card-title">
                          <SiteLink href={`/news/${post.slug}`} locale={locale}>{pick(locale, post.titleKk, post.titleRu)}</SiteLink>
                        </h3>
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}
            </>
          ) : hero.lead ? (
            <p className="resmi-card p-6 leading-relaxed">{hero.lead}</p>
          ) : null}
        </section>

        {feedItems.length > 0 ? (
          <section aria-labelledby="resmi-feed" className="resmi-card resmi-panel">
            <h2 id="resmi-feed" className="resmi-panel-title">{feedTitle}</h2>
            <ul>
              {feedItems.slice(0, 6).map((item) => (
                <li key={item.id} className="resmi-feed-item">
                  <p className="resmi-date">{formatDate(item.publishedAt ?? item.createdAt, locale)}</p>
                  <SiteLink href={`${feedBase}/${item.slug}`} locale={locale} className="resmi-feed-link">
                    {pick(locale, item.titleKk, item.titleRu)}
                  </SiteLink>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section aria-labelledby="resmi-important" className="resmi-card resmi-panel">
          <h2 id="resmi-important" className="resmi-panel-title">{T.important[locale]}</h2>
          <ul className="space-y-1">
            <li>
              <a href="https://darabala.kz" target="_blank" rel="noopener noreferrer" className="resmi-important resmi-important-main">
                <Icon d={ICON.queue} />
                <span>{T.queue[locale]}<span className="sr-only"> ({T.newTab[locale]})</span></span>
              </a>
            </li>
            <li>
              <a href="https://egov.kz" target="_blank" rel="noopener noreferrer" className="resmi-important">
                <Icon d={ICON.egov} />
                <span>{T.egov[locale]}<span className="sr-only"> ({T.newTab[locale]})</span></span>
              </a>
            </li>
            {important.map((section) => (
              <li key={section.id}>
                <SiteLink href={`/${section.slug}`} locale={locale} className="resmi-important">
                  <Icon d={ICON[section.type] ?? ICON.DOCUMENTS} />
                  <span>{pick(locale, section.titleKk, section.titleRu)}</span>
                </SiteLink>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {documents.length > 0 ? (
        <section aria-labelledby="resmi-docs" className="resmi-card p-5 sm:p-6">
          <div className="resmi-section-head">
            <h2 id="resmi-docs">{T.docs[locale]}</h2>
            {docsSection ? (
              <SiteLink href={`/${docsSection.slug}`} locale={locale} className="resmi-more">{T.allDocs[locale]} →</SiteLink>
            ) : null}
          </div>
          <div className="overflow-x-auto">
            <table className="resmi-docs">
              <thead>
                <tr>
                  <th scope="col">{T.docTitle[locale]}</th>
                  <th scope="col" className="hidden md:table-cell">{T.docDate[locale]}</th>
                  <th scope="col" className="hidden sm:table-cell">{T.docSize[locale]}</th>
                  <th scope="col"><span className="sr-only">{T.download[locale]}</span></th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <span className="resmi-format" aria-hidden>{docFormat(doc.media.mime)}</span>
                      <DocLink doc={doc} locale={locale} className="resmi-doc-link">{pick(locale, doc.titleKk, doc.titleRu)}</DocLink>
                    </td>
                    <td className="hidden whitespace-nowrap md:table-cell">{formatDate(doc.publishedAt, locale)}</td>
                    <td className="hidden whitespace-nowrap sm:table-cell">{docFormat(doc.media.mime)} · {formatSize(doc.media.size, locale)}</td>
                    <td className="text-right">
                      <a href={`/api/media/${doc.mediaId}?download=1`} download className="resmi-download">
                        {T.download[locale]}
                        <span className="sr-only">: {pick(locale, doc.titleKk, doc.titleRu)}</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {albums.length > 0 ? (
        <div className="resmi-gallery">
          <GalleryStrip albums={albums.slice(0, 3)} locale={locale} />
        </div>
      ) : null}

      <div className={`grid gap-6 ${head ? 'lg:grid-cols-2' : ''}`}>
        {head ? (
          <section aria-labelledby="resmi-head" className="resmi-card p-5 sm:p-6">
            <h2 id="resmi-head" className="resmi-panel-title">{T.leadership[locale]}</h2>
            <p className="resmi-role">{T.head[locale]}</p>
            <p className="resmi-person">{head}</p>
            {profile?.email ? <p className="mt-2 text-sm"><a href={`mailto:${profile.email}`} className="resmi-text-link">{profile.email}</a></p> : null}
          </section>
        ) : null}

        {profile ? (
          <section aria-labelledby="resmi-contacts" className="resmi-card p-5 sm:p-6">
            <h2 id="resmi-contacts" className="resmi-panel-title">{T.contacts[locale]}</h2>
            <dl className="resmi-dl">
              {address ? (<><dt>{T.address[locale]}</dt><dd>{address}</dd></>) : null}
              {profile.phone || profile.phoneExtra ? (
                <>
                  <dt>{T.phones[locale]}</dt>
                  <dd>
                    {profile.phone ? <a href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`} className="resmi-text-link">{profile.phone}</a> : null}
                    {profile.phone && profile.phoneExtra ? ' · ' : null}
                    {profile.phoneExtra}
                  </dd>
                </>
              ) : null}
              {profile.email ? (<><dt>E-mail</dt><dd><a href={`mailto:${profile.email}`} className="resmi-text-link">{profile.email}</a></dd></>) : null}
              {profile.workHours ? (<><dt>{T.hours[locale]}</dt><dd>{profile.workHours}</dd></>) : null}
            </dl>
            {mapHref ? (
              <a href={mapHref} target="_blank" rel="noopener noreferrer" className="resmi-map-link">
                {T.map[locale]}<span className="sr-only"> ({T.newTab[locale]})</span>
              </a>
            ) : null}
          </section>
        ) : null}
      </div>
    </div>
  );
}
