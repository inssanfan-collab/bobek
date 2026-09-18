import Link from 'next/link';
import { pick } from '@/lib/i18n';
import { withLocale } from '@/server/tenant/context';
import { sectionLink } from '@/lib/sections';
import { SectionIcon } from '@/components/site/SectionIcon';
import {
  AnnouncementList, ContactCard, GalleryStrip, NewsCard, PlacesBadge, T,
} from '@/components/site/blocks';
import { HeroButtons, HeroTitle } from '@/components/site/Hero';
import type { HomeProps } from '../types';

/**
 * Жарқын: название крупно на цветной полосе с волной снизу и кружками-
 * украшениями, под ней — большие круглые кнопки разделов, дальше новости
 * с крупными фото. Самый «детский» из шаблонов.
 *
 * Кружки помечены классом decor — в версии для слабовидящих они скрываются.
 */
export function ZharqynHome({ profile, sections, news, announcements, albums, locale, coverUrl, coverPosition, showContacts, hero }: HomeProps) {

  return (
    <>
      <section className="relative isolate overflow-hidden bg-brand text-white">
        <span className="decor absolute -bottom-16 left-1/3 -z-10 h-40 w-40 rounded-full bg-white/10" aria-hidden />
        <span className="decor absolute right-8 top-10 -z-10 h-16 w-16 rounded-full bg-white/20" aria-hidden />
        <span className="decor absolute -right-16 bottom-10 -z-10 h-56 w-56 rounded-full bg-white/10" aria-hidden />

        <div className="container-page grid items-center gap-8 pb-24 pt-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <HeroTitle hero={hero} tone="light" className="font-display text-4xl font-extrabold leading-tight sm:text-5xl" />
            {hero.lead ? <p className="mt-4 max-w-xl text-lg text-white/90">{hero.lead}</p> : null}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <PlacesBadge profile={profile} locale={locale} />
              <HeroButtons hero={hero} tone="light" />
            </div>
          </div>
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt=""
              style={{ objectPosition: coverPosition }}
              className="aspect-[4/3] w-full rounded-[2.5rem] border-4 border-white/80 object-cover shadow-lift"
            />
          ) : null}
        </div>

        {/* Волна снизу — цветом фона страницы. */}
        <svg className="absolute inset-x-0 bottom-0 h-16 w-full text-surface" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden>
          <path fill="currentColor" d="M0 40c160 30 320 30 480 0s320-30 480 0 320 30 480 0v40H0z" />
        </svg>
      </section>

      <div className="container-page space-y-14 pb-10">
        {sections.length > 0 ? (
          <nav aria-label={T.sections[locale]}>
            <h2 className="sr-only">{T.sections[locale]}</h2>
            <ul className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 lg:grid-cols-6">
              {sections.map((section) => {
                const link = sectionLink(section, (path) => withLocale(path, locale));
                const label = pick(locale, section.titleKk, section.titleRu);
                const inner = (
                  <>
                    <span className="grid h-20 w-20 place-items-center rounded-full bg-brand-soft text-brand-ink ring-4 ring-card transition group-hover:bg-brand group-hover:text-white sm:h-24 sm:w-24">
                      <SectionIcon type={section.type} className="h-9 w-9" />
                    </span>
                    <span className="mt-2 text-center text-sm font-semibold leading-tight">{label}</span>
                  </>
                );
                const className = 'group flex flex-col items-center';
                return (
                  <li key={section.id}>
                    {link.external ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>{inner}</a>
                    ) : (
                      <Link href={link.href} className={className}>{inner}</Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        ) : null}

        <AnnouncementList items={announcements} locale={locale} />

        {news.length > 0 ? (
          <section>
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-display text-3xl font-extrabold">{T.news[locale]}</h2>
              <Link href={withLocale('/news', locale)} className="btn-ghost text-sm">{T.allNews[locale]} →</Link>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {news.slice(0, 4).map((post) => <NewsCard key={post.id} post={post} locale={locale} featured={false} />)}
            </div>
          </section>
        ) : null}

        <GalleryStrip albums={albums} locale={locale} />
        {showContacts ? <ContactCard profile={profile} locale={locale} /> : null}
      </div>
    </>
  );
}
