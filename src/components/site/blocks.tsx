import Link from 'next/link';
import { pick, type Locale } from '@/lib/i18n';
import { withLocale } from '@/server/tenant/context';
import { formatDate } from '@/lib/labels';
import { sectionMeta } from '@/lib/sections';
import type { Album, Media, Post, Section, TenantProfile } from '@prisma/client';

export type PostWithCover = Post & { coverMedia: Media | null };
export type AlbumWithCover = Album & { items: { media: Media }[] };

export const T = {
  news: { kk: 'Жаңалықтар', ru: 'Новости' },
  allNews: { kk: 'Барлық жаңалықтар', ru: 'Все новости' },
  announcements: { kk: 'Хабарландырулар', ru: 'Объявления' },
  gallery: { kk: 'Фотогалерея', ru: 'Фотогалерея' },
  sections: { kk: 'Бөлімдер', ru: 'Разделы сайта' },
  contacts: { kk: 'Байланыс', ru: 'Контакты' },
  noContent: { kk: 'Мазмұн әзірге қосылмаған', ru: 'Материалы пока не добавлены' },
  readMore: { kk: 'Толығырақ', ru: 'Подробнее' },
  places: { kk: 'Бос орындар', ru: 'Свободные места' },
  workHours: { kk: 'Жұмыс уақыты', ru: 'Режим работы' },
  head: { kk: 'Меңгеруші', ru: 'Заведующая' },
} as const;

export function mediaUrl(media: Media | null | undefined): string | null {
  return media ? `/api/media/${media.id}` : null;
}

export function NewsCard({
  post,
  locale,
  basePath = '/news',
  featured = false,
}: {
  post: PostWithCover;
  locale: Locale;
  /** Адрес раздела, которому принадлежит запись — раздел можно переименовать. */
  basePath?: string;
  featured?: boolean;
}) {
  const title = pick(locale, post.titleKk, post.titleRu);
  const excerpt = pick(locale, post.excerptKk, post.excerptRu);
  const cover = mediaUrl(post.coverMedia);

  return (
    <article className={`card group overflow-hidden ${featured ? 'sm:col-span-2' : ''}`}>
      <Link href={withLocale(`${basePath}/${post.slug}`, locale)} className="block">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element -- медиа отдаётся своим роутом, оптимизатор Next тут не нужен
          <img
            src={cover}
            alt={pick(locale, post.coverMedia?.altKk, post.coverMedia?.altRu) || title}
            className={`w-full object-cover transition group-hover:scale-[1.02] ${featured ? 'h-64' : 'h-44'}`}
            loading="lazy"
          />
        ) : (
          <div className={`bg-gradient-to-br from-brand/70 to-accent/60 ${featured ? 'h-64' : 'h-44'}`} aria-hidden />
        )}
        <div className="p-5">
          <p className="text-sm text-muted">{formatDate(post.publishedAt)}</p>
          <h3 className={`mt-1 font-display font-bold group-hover:text-brand ${featured ? 'text-2xl' : 'text-lg'}`}>
            {title}
          </h3>
          {excerpt ? <p className="mt-2 line-clamp-3 text-sm text-muted">{excerpt}</p> : null}
        </div>
      </Link>
    </article>
  );
}

export function AnnouncementList({
  items,
  locale,
  basePath = '/announcements',
}: {
  items: Post[];
  locale: Locale;
  basePath?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
      <h2 className="font-display text-lg font-bold text-amber-900">{T.announcements[locale]}</h2>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex flex-wrap items-baseline gap-x-3">
            <span className="text-sm text-amber-800">{formatDate(item.publishedAt)}</span>
            <Link
              href={withLocale(`${basePath}/${item.slug}`, locale)}
              className="font-semibold text-amber-900 underline underline-offset-2"
            >
              {pick(locale, item.titleKk, item.titleRu)}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SectionTiles({ sections, locale }: { sections: Section[]; locale: Locale }) {
  if (sections.length === 0) return null;

  return (
    <section>
      <h2 className="font-display text-2xl font-extrabold">{T.sections[locale]}</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map((section) => {
          const meta = sectionMeta(section.type, section.slug);
          return (
            <Link
              key={section.id}
              href={withLocale(`/${section.slug}`, locale)}
              className="card flex items-center gap-3 p-4 transition hover:shadow-lift"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-soft text-xl" aria-hidden>
                {meta?.icon ?? '📄'}
              </span>
              <span className="font-semibold">{pick(locale, section.titleKk, section.titleRu)}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function GalleryStrip({
  albums,
  locale,
  basePath = '/gallery',
}: {
  albums: AlbumWithCover[];
  locale: Locale;
  basePath?: string;
}) {
  if (albums.length === 0) return null;

  return (
    <section>
      <h2 className="font-display text-2xl font-extrabold">{T.gallery[locale]}</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {albums.map((album) => {
          const cover = mediaUrl(album.items[0]?.media);
          return (
            <Link key={album.id} href={withLocale(`${basePath}/${album.slug}`, locale)} className="card group overflow-hidden">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover} alt="" className="h-48 w-full object-cover transition group-hover:scale-[1.02]" loading="lazy" />
              ) : (
                <div className="h-48 bg-brand-soft" aria-hidden />
              )}
              <div className="p-4">
                <p className="font-display font-bold group-hover:text-brand">
                  {pick(locale, album.titleKk, album.titleRu)}
                </p>
                {album.takenOn ? <p className="mt-0.5 text-sm text-muted">{formatDate(album.takenOn)}</p> : null}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function ContactCard({ profile, locale }: { profile: TenantProfile | null; locale: Locale }) {
  if (!profile) return null;
  const address = pick(locale, profile.addressKk, profile.addressRu);
  const head = pick(locale, profile.headNameKk, profile.headNameRu);

  return (
    <section className="card p-6">
      <h2 className="font-display text-2xl font-extrabold">{T.contacts[locale]}</h2>
      <dl className="mt-4 space-y-3 text-sm">
        {address ? (
          <div className="flex gap-3">
            <dt className="w-36 shrink-0 text-muted">{locale === 'kk' ? 'Мекенжай' : 'Адрес'}</dt>
            <dd>{address}</dd>
          </div>
        ) : null}
        {profile.phone ? (
          <div className="flex gap-3">
            <dt className="w-36 shrink-0 text-muted">{locale === 'kk' ? 'Телефон' : 'Телефон'}</dt>
            <dd><a href={`tel:${profile.phone.replace(/\s/g, '')}`} className="font-semibold text-brand">{profile.phone}</a></dd>
          </div>
        ) : null}
        {profile.email ? (
          <div className="flex gap-3">
            <dt className="w-36 shrink-0 text-muted">E-mail</dt>
            <dd><a href={`mailto:${profile.email}`} className="font-semibold text-brand">{profile.email}</a></dd>
          </div>
        ) : null}
        {profile.workHours ? (
          <div className="flex gap-3">
            <dt className="w-36 shrink-0 text-muted">{T.workHours[locale]}</dt>
            <dd>{profile.workHours}</dd>
          </div>
        ) : null}
        {head ? (
          <div className="flex gap-3">
            <dt className="w-36 shrink-0 text-muted">{T.head[locale]}</dt>
            <dd>{head}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}

export function PlacesBadge({ profile, locale }: { profile: TenantProfile | null; locale: Locale }) {
  if (!profile?.placesFree) return null;
  return (
    <p className="badge bg-emerald-100 text-emerald-800">
      {T.places[locale]}: {profile.placesFree}
    </p>
  );
}
