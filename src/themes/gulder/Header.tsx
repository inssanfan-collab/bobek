import Link from 'next/link';
import { LinkButton } from '@/components/site/Hero';
import { headerExtras } from '@/lib/hero';
import { pick } from '@/lib/i18n';
import type { ThemeHeaderProps } from '../types';

/**
 * Шапка «Гүлдер» — по образцу №8: на узоре из пастельных рисунков,
 * название малиново-фиолетовым, меню мелкими капителями справа.
 * Полоса с телефоном — если сад её включил.
 */
export function GulderHeader({ profile, locale, homeHref, tools, nav }: ThemeHeaderProps) {
  const name = pick(locale, profile?.shortNameKk || profile?.nameKk, profile?.shortNameRu || profile?.nameRu) || 'Балабақша';
  const extras = headerExtras(profile, locale);
  const words = name.split(' ');
  const middle = Math.ceil(words.length / 2);

  return (
    <header className="site-header gulder-header sticky top-0 z-40">
      {extras.phone || extras.hours ? (
        <div className="gulder-topbar">
          <p className="container-page flex flex-wrap items-center justify-end gap-x-6 gap-y-1 py-1 text-sm">
            {extras.phone ? <a href={`tel:${extras.phone.replace(/[^\d+]/g, '')}`} className="font-bold">{extras.phone}</a> : null}
            {extras.hours ? <span>{extras.hours}</span> : null}
          </p>
        </div>
      ) : null}
      <div className="gulder-row container-page">
        <Link href={homeHref} className="gulder-brand">
          {profile?.logoMediaId ? (
            // eslint-disable-next-line @next/next/no-img-element -- файл отдаёт /api/media
            <img src={`/api/media/${profile.logoMediaId}`} alt="" className="h-11 w-11 shrink-0 object-contain" />
          ) : null}
          <span className="gulder-wordmark">
            <span className="gulder-pink">{words.slice(0, middle).join(' ')}</span>
            {words.length > middle ? <span className="gulder-violet"> {words.slice(middle).join(' ')}</span> : null}
          </span>
        </Link>
        <div className="gulder-side">
          {extras.cta ? <LinkButton link={extras.cta} className="gulder-cta" /> : null}
          <div className="gulder-tools">{tools}</div>
        </div>
      </div>
      <div className="gulder-nav">{nav}</div>
    </header>
  );
}
