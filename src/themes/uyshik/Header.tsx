import Link from 'next/link';
import { LinkButton } from '@/components/site/Hero';
import { EnrollLink } from '@/components/site/theme-kit';
import { headerExtras } from '@/lib/hero';
import { pick } from '@/lib/i18n';
import type { ThemeHeaderProps } from '../types';
import { Mark } from './Doodles';

/**
 * Шапка «Үйшік»: кремовая «вывеска» с домиком-знаком, названием рукописным
 * шрифтом и пунктирной линией, как у забора. Меню — деревянные таблички:
 * при наведении пункт желтеет. Телефон и часы, если сад их включил,
 * стоят узкой полосой сверху.
 */
export function UyshikHeader({ profile, sections, locale, homeHref, tools, nav }: ThemeHeaderProps) {
  const name = pick(locale, profile?.shortNameKk || profile?.nameKk, profile?.shortNameRu || profile?.nameRu) || 'Балабақша';
  const extras = headerExtras(profile, locale);

  return (
    <header className="site-header uyshik-header sticky top-0 z-40">
      {extras.phone || extras.hours ? (
        <div className="uyshik-topbar">
          <p className="container-page flex flex-wrap items-center gap-x-6 gap-y-1 py-1.5 text-sm">
            {extras.phone ? <a href={`tel:${extras.phone.replace(/[^\d+]/g, '')}`} className="font-bold">{extras.phone}</a> : null}
            {extras.hours ? <span className="hidden sm:inline">{extras.hours}</span> : null}
          </p>
        </div>
      ) : null}
      <div className="container-page flex items-center gap-3 py-3 sm:gap-5">
        <Link href={homeHref} className="uyshik-brand flex min-w-0 items-center gap-3">
          {profile?.logoMediaId ? (
            // eslint-disable-next-line @next/next/no-img-element -- файл отдаёт /api/media
            <img src={`/api/media/${profile.logoMediaId}`} alt="" className="uyshik-logo h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14" />
          ) : (
            <Mark className="uyshik-logo h-12 w-12 shrink-0 sm:h-14 sm:w-14" />
          )}
          <span className="min-w-0">
            <span className="uyshik-name block">{name}</span>
            {extras.tagline ? <span className="uyshik-tagline block truncate">{extras.tagline}</span> : null}
          </span>
        </Link>
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          {extras.cta ? (
            <LinkButton link={extras.cta} className="uyshik-cta hidden shrink-0 lg:inline-flex" />
          ) : (
            <EnrollLink menu={sections} locale={locale} className="uyshik-cta hidden shrink-0 lg:inline-flex" />
          )}
          <div className="uyshik-tools flex shrink-0 items-center gap-1">{tools}</div>
        </div>
      </div>
      <div className="uyshik-nav">{nav}</div>
    </header>
  );
}
