import Link from 'next/link';
import { LinkButton } from '@/components/site/Hero';
import { EnrollLink } from '@/components/site/theme-kit';
import { headerExtras } from '@/lib/hero';
import { pick } from '@/lib/i18n';
import type { ThemeHeaderProps } from '../types';

/** Цвета букв названия, как у разноцветного логотипа образца; все от 3:1 на белом. */
const LETTERS = ['#DC2626', '#EA580C', '#16A34A', '#2563EB', '#9333EA', '#DB2777'];

/**
 * Шапка «Қосақ» — по образцу №5: белая, название разноцветными буквами,
 * меню справа, оранжево-красная кнопка-капсула. Полоса с телефоном —
 * если сад её включил.
 */
export function KosaqHeader({ profile, sections, locale, homeHref, tools, nav }: ThemeHeaderProps) {
  const name = pick(locale, profile?.shortNameKk || profile?.nameKk, profile?.shortNameRu || profile?.nameRu) || 'Балабақша';
  const extras = headerExtras(profile, locale);
  let colorIndex = 0;

  return (
    <header className="site-header kosaq-header sticky top-0 z-40">
      {extras.phone || extras.hours ? (
        <div className="kosaq-topbar">
          <p className="container-page flex flex-wrap items-center justify-end gap-x-6 gap-y-1 py-1 text-sm">
            {extras.phone ? <a href={`tel:${extras.phone.replace(/[^\d+]/g, '')}`} className="font-bold">☏ {extras.phone}</a> : null}
            {extras.hours ? <span>◷ {extras.hours}</span> : null}
          </p>
        </div>
      ) : null}
      <div className="kosaq-row container-page">
        <Link href={homeHref} className="kosaq-brand">
          {profile?.logoMediaId ? (
            // eslint-disable-next-line @next/next/no-img-element -- файл отдаёт /api/media
            <img src={`/api/media/${profile.logoMediaId}`} alt="" className="h-11 w-11 shrink-0 object-contain" />
          ) : null}
          <span className="sr-only">{name}</span>
          <span className="kosaq-wordmark" aria-hidden>
            {[...name].map((char, index) => {
              if (char.trim() === '') return <span key={index}> </span>;
              const color = LETTERS[colorIndex % LETTERS.length];
              colorIndex += 1;
              return <span key={index} style={{ color }}>{char}</span>;
            })}
          </span>
        </Link>
        <div className="kosaq-side">
          <div className="kosaq-tools">{tools}</div>
          {extras.cta ? (
            <LinkButton link={extras.cta} className="kosaq-cta" />
          ) : (
            <EnrollLink menu={sections} locale={locale} className="kosaq-cta" />
          )}
        </div>
      </div>
      <div className="kosaq-nav">{nav}</div>
    </header>
  );
}
