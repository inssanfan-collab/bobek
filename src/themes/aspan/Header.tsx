import Link from 'next/link';
import { LinkButton } from '@/components/site/Hero';
import { EnrollLink } from '@/components/site/theme-kit';
import { headerExtras } from '@/lib/hero';
import { pick } from '@/lib/i18n';
import type { ThemeHeaderProps } from '../types';
import { Sun } from './Doodles';

const SOCIAL = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'telegram', label: 'Telegram' },
] as const;

/**
 * Шапка «Аспан» — по образцу №3: жёлтая полоса с почтой, телефоном
 * и адресом, справа соцсети; ниже голубая плашка со скруглёнными углами —
 * знак и название белым, меню, жёлтая кнопка-капсула.
 */
export function AspanHeader({ profile, sections, locale, homeHref, tools, nav }: ThemeHeaderProps) {
  const name = pick(locale, profile?.shortNameKk || profile?.nameKk, profile?.shortNameRu || profile?.nameRu) || 'Балабақша';
  const address = pick(locale, profile?.addressKk, profile?.addressRu);
  const extras = headerExtras(profile, locale);
  const words = name.split(' ');
  const last = words.length > 1 ? words.pop() : null;
  const socials = SOCIAL.filter((item) => profile?.[item.key]);

  return (
    <header className="site-header aspan-header sticky top-0 z-40">
      <div className="aspan-topbar">
        <div className="container-page flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-1.5 text-sm">
          <p className="flex min-w-0 flex-wrap items-center gap-x-6 gap-y-1">
            {profile?.email ? <a href={`mailto:${profile.email}`}>✉ {profile.email}</a> : null}
            {extras.phone ? <a href={`tel:${extras.phone.replace(/[^\d+]/g, '')}`} className="font-bold">☏ {extras.phone}</a> : null}
            {address ? <span className="hidden md:inline">⌖ {address}</span> : null}
          </p>
          {socials.length > 0 ? (
            <p className="hidden items-center gap-5 sm:flex">
              {socials.map((item) => (
                <a key={item.key} href={profile?.[item.key] ?? '#'} target="_blank" rel="noopener noreferrer" className="font-bold">{item.label} ↗</a>
              ))}
            </p>
          ) : null}
        </div>
      </div>
      <div className="aspan-bar">
        <div className="aspan-row container-page">
          <Link href={homeHref} className="aspan-brand">
            {profile?.logoMediaId ? (
              // eslint-disable-next-line @next/next/no-img-element -- файл отдаёт /api/media
              <img src={`/api/media/${profile.logoMediaId}`} alt="" className="h-12 w-12 shrink-0 rounded-full bg-white object-contain p-0.5" />
            ) : (
              <span className="aspan-mark" aria-hidden><Sun className="h-full w-full" /></span>
            )}
            <span className="aspan-wordmark">
              {words.join(' ')}
              {last ? <span className="aspan-wordmark-b"> {last}</span> : null}
            </span>
          </Link>
          <div className="aspan-side">
            <div className="aspan-tools">{tools}</div>
            {extras.cta ? (
              <LinkButton link={extras.cta} className="aspan-cta" />
            ) : (
              <EnrollLink menu={sections} locale={locale} className="aspan-cta" />
            )}
          </div>
        </div>
        <div className="aspan-nav">{nav}</div>
      </div>
    </header>
  );
}
