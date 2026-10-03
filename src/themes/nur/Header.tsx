import Link from 'next/link';
import { LinkButton } from '@/components/site/Hero';
import { headerExtras } from '@/lib/hero';
import { pick } from '@/lib/i18n';
import type { ThemeHeaderProps } from '../types';

/**
 * Шапка «Нұр» — по образцу №7: белая, название красным рукописным
 * шрифтом, меню мелкими красными капителями. Полоса с телефоном —
 * если сад её включил.
 */
export function NurHeader({ profile, locale, homeHref, tools, nav }: ThemeHeaderProps) {
  const name = pick(locale, profile?.shortNameKk || profile?.nameKk, profile?.shortNameRu || profile?.nameRu) || 'Балабақша';
  const extras = headerExtras(profile, locale);

  return (
    <header className="site-header nur-header sticky top-0 z-40">
      {extras.phone || extras.hours ? (
        <div className="nur-topbar">
          <p className="container-page flex flex-wrap items-center justify-end gap-x-6 gap-y-1 py-1 text-sm">
            {extras.phone ? <a href={`tel:${extras.phone.replace(/[^\d+]/g, '')}`} className="font-bold">{extras.phone}</a> : null}
            {extras.hours ? <span>{extras.hours}</span> : null}
          </p>
        </div>
      ) : null}
      <div className="nur-row container-page">
        <Link href={homeHref} className="nur-brand">
          {profile?.logoMediaId ? (
            // eslint-disable-next-line @next/next/no-img-element -- файл отдаёт /api/media
            <img src={`/api/media/${profile.logoMediaId}`} alt="" className="h-11 w-11 shrink-0 object-contain" />
          ) : null}
          <span className="nur-wordmark">{name}</span>
        </Link>
        <div className="nur-side">
          {extras.cta ? <LinkButton link={extras.cta} className="nur-cta" /> : null}
          <div className="nur-tools">{tools}</div>
        </div>
      </div>
      <div className="nur-nav">{nav}</div>
    </header>
  );
}
