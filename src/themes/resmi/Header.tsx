import { SiteLink } from '@/components/site/blocks';
import { LinkButton } from '@/components/site/Hero';
import { headerExtras } from '@/lib/hero';
import { pick } from '@/lib/i18n';
import type { ThemeHeaderProps } from '../types';

const T = {
  skip: { kk: 'Негізгі мазмұнға өту', ru: 'Перейти к основному содержанию' },
  search: { kk: 'Сайт бойынша іздеу', ru: 'Поиск по сайту' },
  searchButton: { kk: 'Іздеу', ru: 'Найти' },
  home: { kk: 'Басты бет', ru: 'Главная' },
  crumbs: { kk: 'Сіз осы жердесіз', ru: 'Вы здесь' },
  reception: { kk: 'Виртуалды қабылдау', ru: 'Виртуальная приёмная' },
  page: { kk: 'Бет', ru: 'Страница' },
  doc: { kk: 'Құжат', ru: 'Документ' },
} as const;

/**
 * Шапка «Ресми» — строгая, как у сайта государственной организации:
 * служебная полоса (телефон, часы, слабовидящие, язык), белая шапка
 * с полным названием и полем поиска, синее меню с золотой линией и под ним
 * навигационная цепочка (приказ МКИ РК № 124-НҚ, п. 40). Первая ссылка —
 * «Перейти к основному содержанию» для клавиатуры и экранного диктора.
 * На главной название сада — заголовок h1: отдельного первого экрана нет.
 */
export function ResmiHeader({ profile, sections, locale, pathname, tools, nav }: ThemeHeaderProps) {
  const name = pick(locale, profile?.nameKk, profile?.nameRu);
  const extras = headerExtras(profile, locale);
  const isHome = pathname === '/' || pathname === '';
  const NameTag = isHome ? 'h1' : 'p';
  const reception = sections.find((section) => section.type === 'FEEDBACK');

  // Цепочка «Главная › Раздел»: раздел — по первой части адреса.
  const first = pathname.split('/').filter(Boolean)[0];
  const section = first ? sections.find((item) => item.slug === first) : undefined;
  const crumb = section
    ? { href: `/${section.slug}`, label: pick(locale, section.titleKk, section.titleRu) }
    : first === 'search'
      ? { href: '/search', label: T.searchButton[locale] }
      : first === 'doc'
        ? { href: pathname, label: T.doc[locale] }
        : first
          ? { href: pathname, label: T.page[locale] }
          : null;

  return (
    <header className="site-header resmi-header sticky top-0 z-40">
      <a href="#main" className="resmi-skip">{T.skip[locale]}</a>

      <div className="resmi-topbar">
        <div className="container-page flex min-h-10 flex-wrap items-center gap-x-5 gap-y-1 py-1 text-sm">
          {extras.phone ? (
            <a href={`tel:${extras.phone.replace(/[^\d+]/g, '')}`} className="font-semibold">{extras.phone}</a>
          ) : null}
          {extras.hours ? <span className="hidden sm:inline">{extras.hours}</span> : null}
          <div className="resmi-tools ml-auto flex items-center gap-1">{tools}</div>
        </div>
      </div>

      <div className="container-page flex flex-wrap items-center gap-4 py-4">
        <SiteLink href="/" locale={locale} className="flex min-w-0 flex-1 items-center gap-4">
          {profile?.logoMediaId ? (
            // eslint-disable-next-line @next/next/no-img-element -- файл отдаёт /api/media
            <img src={`/api/media/${profile.logoMediaId}`} alt="" className="resmi-logo h-14 w-14 shrink-0 object-contain sm:h-16 sm:w-16" />
          ) : (
            <span className="resmi-logo resmi-logo-empty grid h-14 w-14 shrink-0 place-items-center sm:h-16 sm:w-16" aria-hidden>
              {(name || 'Б').replace(/[^A-Za-zА-Яа-яӘәҒғҚқҢңӨөҰұҮүҺһІі]/g, '').charAt(0)}
            </span>
          )}
          <span className="min-w-0">
            {extras.taglineCustom ? <span className="resmi-parent block">{extras.tagline}</span> : null}
            <NameTag className="resmi-name">{name || 'Балабақша'}</NameTag>
            {!extras.taglineCustom && extras.tagline ? <span className="resmi-district block">{extras.tagline}</span> : null}
          </span>
        </SiteLink>

        <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto">
          <form action="/search" method="get" role="search" className="resmi-search flex min-w-0 flex-1 lg:w-80 lg:flex-none">
            <input type="hidden" name="lang" value={locale} />
            <label htmlFor="resmi-q" className="sr-only">{T.search[locale]}</label>
            <input id="resmi-q" name="q" type="search" minLength={2} maxLength={200} placeholder={T.search[locale]} className="min-w-0 flex-1" />
            <button type="submit" aria-label={T.searchButton[locale]}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>
          </form>
          {extras.cta ? (
            <LinkButton link={extras.cta} className="resmi-cta btn hidden shrink-0 sm:inline-flex" />
          ) : reception ? (
            <SiteLink href={`/${reception.slug}`} locale={locale} className="resmi-cta btn hidden shrink-0 sm:inline-flex">
              {T.reception[locale]}
            </SiteLink>
          ) : null}
        </div>
      </div>

      <div className="resmi-nav">{nav}</div>

      {crumb ? (
        <nav aria-label={T.crumbs[locale]} className="resmi-crumbs">
          <ol className="container-page flex flex-wrap items-center gap-2 py-2 text-sm">
            <li><SiteLink href="/" locale={locale}>{T.home[locale]}</SiteLink></li>
            <li aria-hidden>›</li>
            <li>
              {pathname.split('/').filter(Boolean).length > 1 ? (
                <SiteLink href={crumb.href} locale={locale}>{crumb.label}</SiteLink>
              ) : (
                <span aria-current="page">{crumb.label}</span>
              )}
            </li>
          </ol>
        </nav>
      ) : null}
    </header>
  );
}
