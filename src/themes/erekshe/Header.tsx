import Link from 'next/link';
import { LinkButton } from '@/components/site/Hero';
import { headerExtras } from '@/lib/hero';
import { pick } from '@/lib/i18n';
import type { ThemeHeaderProps } from '../types';
import { Mark } from './Doodles';

/** Цвета букв названия, как у логотипа образца; все от 3:1 на белом. */
const LETTERS = ['#DC2626', '#EA580C', '#CA8A04', '#16A34A', '#2563EB', '#9333EA'];

/**
 * Шапка «Ерекше» — по образцу №6: белая, название разноцветными буквами,
 * меню мелкими розовыми капителями. Полоса с телефоном — если сад её включил.
 */
export function ErekshHeader({ profile, locale, homeHref, tools, nav }: ThemeHeaderProps) {
  const name = pick(locale, profile?.shortNameKk || profile?.nameKk, profile?.shortNameRu || profile?.nameRu) || 'Балабақша';
  const extras = headerExtras(profile, locale);
  let colorIndex = 0;

  return (
    <header className="site-header erekshe-header sticky top-0 z-40">
      {extras.phone || extras.hours ? (
        <div className="erekshe-topbar">
          <p className="container-page flex flex-wrap items-center justify-end gap-x-6 gap-y-1 py-1 text-sm">
            {extras.phone ? <a href={`tel:${extras.phone.replace(/[^\d+]/g, '')}`} className="font-bold">{extras.phone}</a> : null}
            {extras.hours ? <span>{extras.hours}</span> : null}
          </p>
        </div>
      ) : null}
      <div className="erekshe-row container-page">
        <Link href={homeHref} className="erekshe-brand">
          {profile?.logoMediaId ? (
            // eslint-disable-next-line @next/next/no-img-element -- файл отдаёт /api/media
            <img src={`/api/media/${profile.logoMediaId}`} alt="" className="h-11 w-11 shrink-0 object-contain" />
          ) : (
            <Mark className="h-10 w-10 shrink-0" />
          )}
          <span className="sr-only">{name}</span>
          <span className="erekshe-wordmark" aria-hidden>
            {[...name].map((char, index) => {
              if (char.trim() === '') return <span key={index}> </span>;
              const color = LETTERS[colorIndex % LETTERS.length];
              colorIndex += 1;
              return <span key={index} style={{ color }}>{char}</span>;
            })}
          </span>
        </Link>
        <div className="erekshe-side">
          {extras.cta ? <LinkButton link={extras.cta} className="erekshe-cta hidden lg:inline-flex" /> : null}
          <div className="erekshe-tools">{tools}</div>
        </div>
      </div>
      <div className="erekshe-nav">{nav}</div>
    </header>
  );
}
