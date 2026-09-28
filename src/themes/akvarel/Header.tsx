import Link from 'next/link';
import { pick } from '@/lib/i18n';
import { headerExtras } from '@/lib/hero';
import { LinkButton } from '@/components/site/Hero';
import type { ThemeHeaderProps } from '../types';
import { Sun } from './Doodles';

/**
 * Шапка «Акварели»: светлая, с солнышком вместо логотипа (если своего нет),
 * кнопки-«таблетки». Телефон и часы — строкой над названием, только если
 * сад включил их в «Главной странице».
 */
export function AkvarelHeader({ profile, locale, homeHref, tools, nav }: ThemeHeaderProps) {
  const name = pick(locale, profile?.shortNameKk || profile?.nameKk, profile?.shortNameRu || profile?.nameRu);
  const extras = headerExtras(profile, locale);

  return (
    <header className="site-header akvarel-header sticky top-0 z-40">
      <div className="container-page flex items-center justify-between gap-3 pt-2 text-sm">
        <p className="akvarel-contacts flex min-w-0 items-center gap-4">
          {extras.phone ? (
            <a href={`tel:${extras.phone.replace(/[^\d+]/g, '')}`} className="font-bold">{extras.phone}</a>
          ) : null}
          {extras.hours ? <span className="hidden sm:inline">{extras.hours}</span> : null}
        </p>
        <div className="flex shrink-0 items-center gap-1">{tools}</div>
      </div>

      <div className="container-page flex items-center gap-4 py-3">
        <Link href={homeHref} className="flex min-w-0 items-center gap-3">
          {profile?.logoMediaId ? (
            // eslint-disable-next-line @next/next/no-img-element -- файл отдаёт /api/media
            <img src={`/api/media/${profile.logoMediaId}`} alt="" className="akvarel-logo h-14 w-14 shrink-0 object-contain" />
          ) : (
            <span className="akvarel-logo grid h-14 w-14 shrink-0 place-items-center" aria-hidden>
              <Sun className="h-10 w-10" />
            </span>
          )}
          <span className="min-w-0">
            <span className="akvarel-name block">{name || 'Балабақша'}</span>
            {extras.tagline ? <span className="akvarel-tagline block truncate">{extras.tagline}</span> : null}
          </span>
        </Link>
        {extras.cta ? <LinkButton link={extras.cta} className="akvarel-cta btn ml-auto hidden shrink-0 sm:inline-flex" /> : null}
      </div>

      <div className="akvarel-nav">{nav}</div>
    </header>
  );
}
