import Link from 'next/link';
import { pick } from '@/lib/i18n';
import { withLocale } from '@/server/tenant/context';
import {
  AnnouncementList, ContactCard, GalleryStrip, NewsCard, PlacesBadge, SectionTiles, T,
} from '@/components/site/blocks';
import type { HomeProps } from '../types';

/**
 * Қағаз: без карточек и теней — только типографика и тонкие линии.
 * Спокойный вариант для садов, которым яркая вёрстка не подходит: узор
 * фона на нём читается лучше всего, потому что ничем не закрыт.
 */
export function KagazHome({ profile, sections, news, announcements, albums, locale, coverUrl }: HomeProps) {
  const name = pick(locale, profile?.nameKk, profile?.nameRu);
  const about = pick(locale, profile?.aboutKk, profile?.aboutRu);

  return (
    <div className="container-page max-w-5xl space-y-12 py-12">
      <section className="border-b-2 border-ink pb-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-ink">
          {profile?.district ?? T.sections[locale]}
        </p>
        <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight sm:text-5xl">{name}</h1>
        {about ? <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted">{about}</p> : null}

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <PlacesBadge profile={profile} locale={locale} />
          {profile?.phone ? (
            <a
              href={`tel:${profile.phone.replace(/\s/g, '')}`}
              className="font-display text-xl font-bold underline decoration-brand decoration-2 underline-offset-4"
            >
              {profile.phone}
            </a>
          ) : null}
        </div>
      </section>

      {coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverUrl} alt="" className="h-72 w-full object-cover" />
      ) : null}

      <AnnouncementList items={announcements} locale={locale} />

      {news.length > 0 ? (
        <section>
          <div className="flex items-end justify-between gap-4 border-b border-line pb-3">
            <h2 className="font-display text-2xl font-extrabold">{T.news[locale]}</h2>
            <Link href={withLocale('/news', locale)} className="text-sm font-bold text-brand-ink">
              {T.allNews[locale]} →
            </Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((post) => (
              <NewsCard key={post.id} post={post} locale={locale} />
            ))}
          </div>
        </section>
      ) : null}

      <SectionTiles sections={sections} locale={locale} />
      <GalleryStrip albums={albums} locale={locale} />
      <ContactCard profile={profile} locale={locale} />
    </div>
  );
}
