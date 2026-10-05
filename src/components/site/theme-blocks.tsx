import type { ReactNode } from 'react';
import type { Post, Section } from '@prisma/client';
import { PinnedMark, SiteLink } from '@/components/site/blocks';
import { formatSize } from '@/lib/file-cards';
import { pick, type Locale } from '@/lib/i18n';
import { formatDate } from '@/lib/labels';
import { isOfficeDoc } from '@/lib/media-kind';
import type { DocumentWithMedia, LatestPhoto } from '@/templates/types';

/*
 * Общие блоки главной для индивидуальных тем: объявления, последние
 * документы таблицей (как в «Ресми») и последние фото галереи. Заголовок
 * секции рисует тема — своим шрифтом и цветами; здесь только содержимое
 * с нейтральными классами `kit-*` (globals.css), которые тема может
 * перекрасить под себя.
 */

const T = {
  docTitle: { kk: 'Құжат атауы', ru: 'Название документа' },
  docDate: { kk: 'Күні', ru: 'Дата' },
  docSize: { kk: 'Пішімі мен көлемі', ru: 'Формат и размер' },
  download: { kk: 'Жүктеп алу', ru: 'Скачать' },
  allDocs: { kk: 'Барлық құжаттар', ru: 'Все документы' },
  allPhotos: { kk: 'Барлық фото', ru: 'Все фото' },
  allAnnouncements: { kk: 'Барлық хабарландырулар', ru: 'Все объявления' },
} as const;

/** Подпись формата файла: PDF, DOC, XLS, JPG… */
export function docFormat(mime: string): string {
  if (mime === 'application/pdf') return 'PDF';
  if (mime.includes('word')) return 'DOC';
  if (mime.includes('sheet') || mime.includes('excel')) return 'XLS';
  if (mime.startsWith('image/')) return mime.slice(6).toUpperCase();
  return 'FILE';
}

/** Ссылка на документ: Word и Excel открывает просмотрщик /doc, остальное браузер показывает сам. */
export function DocLink({ doc, locale, className, children }: { doc: DocumentWithMedia; locale: Locale; className?: string; children: ReactNode }) {
  return isOfficeDoc(doc.media.mime) ? (
    <SiteLink href={`/doc/${doc.id}`} locale={locale} className={className}>{children}</SiteLink>
  ) : (
    <a href={`/api/media/${doc.mediaId}`} target="_blank" rel="noopener" className={className}>{children}</a>
  );
}

/** Последние документы таблицей: название, дата, формат и размер, «Скачать». */
export function DocsTable({ documents, locale, docsSection }: { documents: DocumentWithMedia[]; locale: Locale; docsSection?: Section }) {
  if (documents.length === 0) return null;
  return (
    <div className="kit-docs-card">
      <div className="overflow-x-auto">
        <table className="kit-docs">
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
                  <span className="kit-format" aria-hidden>{docFormat(doc.media.mime)}</span>
                  <DocLink doc={doc} locale={locale} className="kit-doc-link">{pick(locale, doc.titleKk, doc.titleRu)}</DocLink>
                </td>
                <td className="hidden whitespace-nowrap md:table-cell">{formatDate(doc.publishedAt, locale)}</td>
                <td className="hidden whitespace-nowrap sm:table-cell">{docFormat(doc.media.mime)} · {formatSize(doc.media.size, locale)}</td>
                <td className="text-right">
                  <a href={`/api/media/${doc.mediaId}?download=1`} download className="kit-download">
                    {T.download[locale]}
                    <span className="sr-only">: {pick(locale, doc.titleKk, doc.titleRu)}</span>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {docsSection ? (
        <p className="kit-block-more">
          <SiteLink href={`/${docsSection.slug}`} locale={locale}>{T.allDocs[locale]} →</SiteLink>
        </p>
      ) : null}
    </div>
  );
}

/** Объявления: дата и заголовок строкой, ссылка на раздел. */
export function AnnouncementsList({ items, locale, section }: { items: Post[]; locale: Locale; section?: Section }) {
  if (items.length === 0) return null;
  const base = `/${section?.slug ?? 'announcements'}`;
  return (
    <div className="kit-ann">
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.isPinned ? <PinnedMark locale={locale} /> : null}
            <span className="kit-ann-date">{formatDate(item.publishedAt, locale)}</span>
            <SiteLink href={`${base}/${item.slug}`} locale={locale} className="kit-ann-link">{pick(locale, item.titleKk, item.titleRu)}</SiteLink>
          </li>
        ))}
      </ul>
      {section ? (
        <p className="kit-block-more">
          <SiteLink href={base} locale={locale}>{T.allAnnouncements[locale]} →</SiteLink>
        </p>
      ) : null}
    </div>
  );
}

/** Последние фото галереи: три снимка, каждый ведёт в свой альбом. */
export function LatestPhotos({ photos, locale, gallerySection }: { photos: LatestPhoto[]; locale: Locale; gallerySection?: Section }) {
  if (photos.length === 0) return null;
  const base = `/${gallerySection?.slug ?? 'gallery'}`;
  return (
    <div>
      <ul className={`kit-photos kit-photos-${photos.length}`}>
        {photos.map((photo) => (
          <li key={photo.id}>
            <SiteLink href={`${base}/${photo.album.slug}`} locale={locale} className="kit-photo">
              {/* eslint-disable-next-line @next/next/no-img-element -- медиа отдаёт свой роут */}
              <img src={`/api/media/${photo.media.id}`} alt={pick(locale, photo.media.altKk, photo.media.altRu) || pick(locale, photo.album.titleKk, photo.album.titleRu)} loading="lazy" />
              <span className="kit-photo-title">{pick(locale, photo.album.titleKk, photo.album.titleRu)}</span>
            </SiteLink>
          </li>
        ))}
      </ul>
      {gallerySection ? (
        <p className="kit-block-more kit-block-more-center">
          <SiteLink href={base} locale={locale}>{T.allPhotos[locale]} →</SiteLink>
        </p>
      ) : null}
    </div>
  );
}
