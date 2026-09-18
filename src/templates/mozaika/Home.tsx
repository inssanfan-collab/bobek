import Link from 'next/link';
import { pick } from '@/lib/i18n';
import { withLocale } from '@/server/tenant/context';
import { formatDate } from '@/lib/labels';
import {
  AnnouncementList, ContactCard, GalleryStrip, mediaUrl, NewsCard, PlacesBadge, SectionTiles, T,
} from '@/components/site/blocks';
import { HeroButtons, HeroTitle } from '@/components/site/Hero';
import type { HomeProps } from '../types';

const M = {
  call: { kk: 'Қоңырау шалу', ru: 'Позвонить' },
  hours: { kk: 'Жұмыс уақыты', ru: 'Режим работы' },
  about: { kk: 'Біз туралы', ru: 'О нас' },
} as const;

/**
 * Мозаика: первый экран — плитки разного размера. Большая — обложка
 * с названием, цветная — о саде, светлая — телефон и режим, две — свежие
 * новости. Ниже — остальное, как у всех шаблонов.
 */
export function MozaikaHome({ profile, sections, news, announcements, albums, locale, coverUrl, coverPosition, showContacts, hero }: HomeProps) {
  const name = pick(locale, profile?.nameKk, profile?.nameRu);
  const [first, second, ...rest] = news;
  const phone = profile?.phone;

  return (
    <div className="container-page space-y-12 py-8">
      <section className="grid auto-rows-[minmax(10rem,auto)] gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative isolate overflow-hidden rounded-3xl sm:col-span-2 sm:row-span-2">
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="" style={{ objectPosition: coverPosition }} className="absolute inset-0 -z-10 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand to-accent" aria-hidden />
          )}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/65 via-black/20 to-transparent" aria-hidden />
          <div className="flex h-full min-h-[18rem] flex-col justify-end p-6 text-white sm:p-8">
            <HeroTitle hero={hero} tone="light" className="font-display text-3xl font-extrabold drop-shadow sm:text-4xl" />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <PlacesBadge profile={profile} locale={locale} />
              <HeroButtons hero={hero} tone="light" />
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-3xl bg-brand p-6 text-white">
          <p className="text-sm font-semibold uppercase tracking-wider text-white/80">{M.about[locale]}</p>
          <p className="mt-3 line-clamp-6 text-base leading-relaxed">{hero.lead || name}</p>
        </div>

        <div className="flex flex-col justify-between rounded-3xl border border-line bg-brand-soft p-6 text-brand-ink">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider">{M.hours[locale]}</p>
            <p className="mt-2 font-display text-xl font-bold">{profile?.workHours ?? '—'}</p>
          </div>
          {phone ? (
            <a href={`tel:${phone.replace(/\s/g, '')}`} className="btn-primary mt-4 w-full">
              {M.call[locale]}: {phone}
            </a>
          ) : null}
        </div>

        {[first, second].map((post) =>
          post ? (
            <Link
              key={post.id}
              href={withLocale(`/news/${post.slug}`, locale)}
              className="card group relative isolate flex min-h-[10rem] flex-col justify-end overflow-hidden p-5"
            >
              {post.coverMedia ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl(post.coverMedia) ?? ''} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover transition group-hover:scale-[1.03]" loading="lazy" />
              ) : (
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-accent/70 to-brand/70" aria-hidden />
              )}
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 to-black/5" aria-hidden />
              <p className="text-xs text-white/85">{formatDate(post.publishedAt, locale)}</p>
              <h2 className="mt-1 line-clamp-2 font-display text-lg font-bold text-white">{pick(locale, post.titleKk, post.titleRu)}</h2>
            </Link>
          ) : null,
        )}
      </section>

      <AnnouncementList items={announcements} locale={locale} />

      {rest.length > 0 ? (
        <section>
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-extrabold">{T.news[locale]}</h2>
            <Link href={withLocale('/news', locale)} className="btn-ghost text-sm">{T.allNews[locale]} →</Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {rest.map((post) => <NewsCard key={post.id} post={post} locale={locale} />)}
          </div>
        </section>
      ) : null}

      <SectionTiles sections={sections} locale={locale} />
      <GalleryStrip albums={albums} locale={locale} />
      {showContacts ? <ContactCard profile={profile} locale={locale} /> : null}
    </div>
  );
}
