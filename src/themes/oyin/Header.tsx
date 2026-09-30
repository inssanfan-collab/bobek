import Link from 'next/link';
import { pick } from '@/lib/i18n';
import { headerExtras } from '@/lib/hero';
import { LinkButton } from '@/components/site/Hero';
import type { ThemeHeaderProps } from '../types';

/**
 * Шапка «Ойын алаңы»: синяя полоса, название сада — на жёлтой плашке
 * со скруглённым нижним углом, как в образце. Справа — слабовидящие
 * и язык, под ними — меню белым по синему.
 */
export function OyinHeader({ profile, locale, homeHref, tools, nav }: ThemeHeaderProps) {
  const name = pick(locale, profile?.shortNameKk || profile?.nameKk, profile?.shortNameRu || profile?.nameRu);
  const extras = headerExtras(profile, locale);

  return (
    <header className="site-header oyin-header sticky top-0 z-40">
      <div className="container-page flex items-start gap-3 sm:gap-4">
        <Link href={homeHref} className="oyin-plate flex min-w-0 items-center gap-3">
          {profile?.logoMediaId ? (
            // eslint-disable-next-line @next/next/no-img-element -- файл отдаёт /api/media
            <img src={`/api/media/${profile.logoMediaId}`} alt="" className="oyin-logo h-11 w-11 shrink-0 object-contain sm:h-14 sm:w-14" />
          ) : null}
          <span className="min-w-0">
            <span className="oyin-name block">{name || 'Балабақша'}</span>
            {extras.tagline ? <span className="oyin-tagline block truncate">{extras.tagline}</span> : null}
          </span>
        </Link>
        <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2 py-3 sm:gap-3">
          {extras.phone ? (
            <a href={`tel:${extras.phone.replace(/[^\d+]/g, '')}`} className="oyin-head-phone hidden font-bold lg:inline">{extras.phone}</a>
          ) : null}
          {extras.cta ? <LinkButton link={extras.cta} className="oyin-cta btn hidden shrink-0 sm:inline-flex" /> : null}
          <div className="oyin-tools flex shrink-0 items-center gap-1">{tools}</div>
        </div>
      </div>

      <div className="oyin-nav">{nav}</div>
    </header>
  );
}
