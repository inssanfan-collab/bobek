import Link from 'next/link';
import { pick } from '@/lib/i18n';
import { headerExtras } from '@/lib/hero';
import { LinkButton } from '@/components/site/Hero';
import type { ThemeHeaderProps } from '../types';
import { KonMark } from './Blocks';

/**
 * Шапка «Конструктора»: тёмная полоса с телефоном и обязательными кнопками,
 * ниже — знак из кубиков, название и жёлтая кнопка с жирной обводкой.
 * Снизу — толстая линия, как край деревянной доски.
 */
export function KonstruktorHeader({ profile, locale, homeHref, tools, nav }: ThemeHeaderProps) {
  const name = pick(locale, profile?.shortNameKk || profile?.nameKk, profile?.shortNameRu || profile?.nameRu);
  const extras = headerExtras(profile, locale);

  return (
    <header className="site-header kon-header sticky top-0 z-40">
      <div className="kon-topbar">
        <div className="container-page flex items-center justify-between gap-3 py-1.5 text-sm">
          <p className="flex min-w-0 items-center gap-5 font-medium">
            {extras.phone ? (
              <a href={`tel:${extras.phone.replace(/[^\d+]/g, '')}`} className="font-bold">{extras.phone}</a>
            ) : null}
            {extras.hours ? <span className="hidden sm:inline">{extras.hours}</span> : null}
          </p>
          <div className="flex shrink-0 items-center gap-1">{tools}</div>
        </div>
      </div>

      <div className="container-page flex items-center gap-4 py-3">
        <Link href={homeHref} className="flex min-w-0 items-center gap-3">
          {profile?.logoMediaId ? (
            // eslint-disable-next-line @next/next/no-img-element -- файл отдаёт /api/media
            <img src={`/api/media/${profile.logoMediaId}`} alt="" className="kon-logo h-14 w-14 shrink-0 object-contain" />
          ) : (
            <KonMark className="h-10 w-[4.3rem] shrink-0" />
          )}
          <span className="min-w-0">
            <span className="kon-name block">{name || 'Балабақша'}</span>
            {extras.tagline ? <span className="kon-tagline block truncate">{extras.tagline}</span> : null}
          </span>
        </Link>
        {extras.cta ? <LinkButton link={extras.cta} className="kon-cta btn ml-auto hidden shrink-0 sm:inline-flex" /> : null}
      </div>

      <div className="kon-nav">{nav}</div>
    </header>
  );
}
