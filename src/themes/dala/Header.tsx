import Link from 'next/link';
import { pick } from '@/lib/i18n';
import { headerExtras } from '@/lib/hero';
import { LinkButton } from '@/components/site/Hero';
import type { ThemeHeaderProps } from '../types';
import { DalaMark } from './Ornament';

/**
 * Шапка «Далы»: тёмно-бирюзовая полоса с телефоном, часами и обязательными
 * кнопками, ниже — знак и название сада, кнопка действия, строкой — меню.
 * Телефон и часы в полосе — только если сад включил их в «Главной странице».
 */
export function DalaHeader({ profile, locale, homeHref, tools, nav }: ThemeHeaderProps) {
  const name = pick(locale, profile?.shortNameKk || profile?.nameKk, profile?.shortNameRu || profile?.nameRu);
  const extras = headerExtras(profile, locale);

  return (
    <header className="site-header dala-header sticky top-0 z-40">
      <div className="dala-topbar">
        <div className="container-page flex items-center justify-between gap-3 py-1.5 text-sm">
          <p className="flex min-w-0 items-center gap-5">
            {extras.phone ? (
              <a href={`tel:${extras.phone.replace(/[^\d+]/g, '')}`} className="flex items-center gap-1.5 font-semibold">
                <PhoneIcon />
                {extras.phone}
              </a>
            ) : null}
            {extras.hours ? (
              <span className="hidden items-center gap-1.5 sm:flex">
                <ClockIcon />
                {extras.hours}
              </span>
            ) : null}
          </p>
          <div className="flex shrink-0 items-center gap-1">{tools}</div>
        </div>
      </div>

      <div className="container-page flex items-center gap-4 py-3">
        <Link href={homeHref} className="flex min-w-0 items-center gap-3">
          {profile?.logoMediaId ? (
            // eslint-disable-next-line @next/next/no-img-element -- файл отдаёт /api/media
            <img src={`/api/media/${profile.logoMediaId}`} alt="" className="h-12 w-12 shrink-0 rounded-full object-contain" />
          ) : (
            <DalaMark className="h-12 w-12 shrink-0" />
          )}
          <span className="min-w-0">
            <span className="dala-name block">{name || 'Балабақша'}</span>
            {extras.tagline ? <span className="dala-tagline block truncate">{extras.tagline}</span> : null}
          </span>
        </Link>
        {extras.cta ? <LinkButton link={extras.cta} className="dala-cta btn ml-auto hidden shrink-0 sm:inline-flex" /> : null}
      </div>

      <div className="dala-nav">{nav}</div>
    </header>
  );
}

function PhoneIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
