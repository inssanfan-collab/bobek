import Link from 'next/link';
import { pick } from '@/lib/i18n';
import { headerExtras } from '@/lib/hero';
import { LinkButton } from '@/components/site/Hero';
import type { ThemeHeaderProps } from '../types';
import { Swan } from './Doodles';

/**
 * Шапка «Аққу»: белая, с лебедем в круге вместо логотипа (если своего нет),
 * кнопки-«таблетки». Название и обязательные кнопки (слабовидящие, язык) —
 * одной строкой; телефон и часы — сиреневой полоской над ними, если сад
 * их включил.
 */
export function AkkuHeader({ profile, locale, homeHref, tools, nav }: ThemeHeaderProps) {
  const name = pick(locale, profile?.shortNameKk || profile?.nameKk, profile?.shortNameRu || profile?.nameRu);
  const extras = headerExtras(profile, locale);

  return (
    <header className="site-header akku-header sticky top-0 z-40">
      {extras.phone || extras.hours ? (
        <div className="akku-topline">
          <p className="container-page flex min-w-0 items-center gap-4 py-1.5 text-sm">
            {extras.phone ? (
              <a href={`tel:${extras.phone.replace(/[^\d+]/g, '')}`} className="font-bold">{extras.phone}</a>
            ) : null}
            {extras.hours ? <span className="hidden sm:inline">{extras.hours}</span> : null}
          </p>
        </div>
      ) : null}

      <div className="container-page flex items-center gap-3 py-3 sm:gap-4">
        <Link href={homeHref} className="flex min-w-0 items-center gap-3">
          {profile?.logoMediaId ? (
            // eslint-disable-next-line @next/next/no-img-element -- файл отдаёт /api/media
            <img src={`/api/media/${profile.logoMediaId}`} alt="" className="akku-logo h-11 w-11 shrink-0 sm:h-14 sm:w-14 object-contain" />
          ) : (
            <Swan round className="akku-logo h-11 w-11 shrink-0 sm:h-14 sm:w-14" />
          )}
          <span className="min-w-0">
            <span className="akku-name block">{name || 'Балабақша'}</span>
            {extras.tagline ? <span className="akku-tagline block truncate">{extras.tagline}</span> : null}
          </span>
        </Link>
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          {extras.cta ? <LinkButton link={extras.cta} className="akku-cta btn hidden shrink-0 sm:inline-flex" /> : null}
          <div className="flex shrink-0 items-center gap-1">{tools}</div>
        </div>
      </div>

      <div className="akku-nav">{nav}</div>
    </header>
  );
}
