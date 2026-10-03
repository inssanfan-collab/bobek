import Link from 'next/link';
import { LinkButton } from '@/components/site/Hero';
import { EnrollLink } from '@/components/site/theme-kit';
import { headerExtras } from '@/lib/hero';
import { pick } from '@/lib/i18n';
import type { ThemeHeaderProps } from '../types';

/** Цвета букв названия, как у логотипа образца; все от 3:1 на белом. */
const LETTERS = ['#DC2626', '#EA580C', '#CA8A04', '#16A34A', '#2563EB', '#7C3AED', '#DB2777'];

const SOCIAL = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'telegram', label: 'Telegram' },
] as const;

/**
 * Шапка «Күнбағыс» — по образцу №10: оранжевая полоса с адресом
 * и соцсетями, белая строка — название разноцветными буквами, меню
 * с цветными значками над пунктами, оранжевая кнопка-капсула.
 */
export function KunbagysHeader({ profile, sections, locale, homeHref, tools, nav }: ThemeHeaderProps) {
  const name = pick(locale, profile?.shortNameKk || profile?.nameKk, profile?.shortNameRu || profile?.nameRu) || 'Балабақша';
  const address = pick(locale, profile?.addressKk, profile?.addressRu);
  const extras = headerExtras(profile, locale);
  const socials = SOCIAL.filter((item) => profile?.[item.key]);
  let colorIndex = 0;

  return (
    <header className="site-header kunbagys-header sticky top-0 z-40">
      <div className="kunbagys-topbar">
        <div className="container-page flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-1.5 text-sm">
          <p className="flex min-w-0 flex-wrap items-center gap-x-5">
            {address ? <span className="hidden truncate sm:inline">{address}</span> : null}
            {extras.phone ? <a href={`tel:${extras.phone.replace(/[^\d+]/g, '')}`} className="font-bold">{extras.phone}</a> : null}
          </p>
          {socials.length > 0 ? (
            <p className="flex items-center gap-4">
              {socials.map((item) => (
                <a key={item.key} href={profile?.[item.key] ?? '#'} target="_blank" rel="noopener noreferrer" className="font-bold">{item.label}</a>
              ))}
            </p>
          ) : null}
        </div>
      </div>
      <div className="kunbagys-row container-page">
        <Link href={homeHref} className="kunbagys-brand">
          {profile?.logoMediaId ? (
            // eslint-disable-next-line @next/next/no-img-element -- файл отдаёт /api/media
            <img src={`/api/media/${profile.logoMediaId}`} alt="" className="h-11 w-11 shrink-0 object-contain" />
          ) : null}
          <span className="sr-only">{name}</span>
          <span className="kunbagys-wordmark" aria-hidden>
            {[...name].map((char, index) => {
              if (char.trim() === '') return <span key={index}> </span>;
              const color = LETTERS[colorIndex % LETTERS.length];
              colorIndex += 1;
              return <span key={index} style={{ color }}>{char}</span>;
            })}
          </span>
        </Link>
        <div className="kunbagys-side">
          <div className="kunbagys-tools">{tools}</div>
          {extras.cta ? (
            <LinkButton link={extras.cta} className="kunbagys-cta" />
          ) : (
            <EnrollLink menu={sections} locale={locale} className="kunbagys-cta" />
          )}
        </div>
      </div>
      <div className="kunbagys-nav">{nav}</div>
    </header>
  );
}
