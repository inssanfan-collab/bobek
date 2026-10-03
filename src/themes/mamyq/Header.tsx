import Link from 'next/link';
import { LinkButton } from '@/components/site/Hero';
import { EnrollLink } from '@/components/site/theme-kit';
import { headerExtras } from '@/lib/hero';
import { pick } from '@/lib/i18n';
import type { ThemeHeaderProps } from '../types';

/**
 * Шапка «Мамық» — по образцу №9: белая, название розовым, меню
 * по центру, справа розовая кнопка-контур. Полоса с телефоном —
 * если сад её включил.
 */
export function MamyqHeader({ profile, sections, locale, homeHref, tools, nav }: ThemeHeaderProps) {
  const name = pick(locale, profile?.shortNameKk || profile?.nameKk, profile?.shortNameRu || profile?.nameRu) || 'Балабақша';
  const extras = headerExtras(profile, locale);

  return (
    <header className="site-header mamyq-header sticky top-0 z-40">
      {extras.phone || extras.hours ? (
        <div className="mamyq-topbar">
          <p className="container-page flex flex-wrap items-center justify-end gap-x-6 gap-y-1 py-1 text-sm">
            {extras.phone ? <a href={`tel:${extras.phone.replace(/[^\d+]/g, '')}`} className="font-bold">{extras.phone}</a> : null}
            {extras.hours ? <span>{extras.hours}</span> : null}
          </p>
        </div>
      ) : null}
      <div className="mamyq-row container-page">
        <Link href={homeHref} className="mamyq-brand">
          {profile?.logoMediaId ? (
            // eslint-disable-next-line @next/next/no-img-element -- файл отдаёт /api/media
            <img src={`/api/media/${profile.logoMediaId}`} alt="" className="h-11 w-11 shrink-0 object-contain" />
          ) : null}
          <span className="mamyq-wordmark">{name}</span>
        </Link>
        <div className="mamyq-side">
          <div className="mamyq-tools">{tools}</div>
          {extras.cta ? (
            <LinkButton link={extras.cta} className="mamyq-outline mamyq-cta" />
          ) : (
            <EnrollLink menu={sections} locale={locale} className="mamyq-outline mamyq-cta" />
          )}
        </div>
      </div>
      <div className="mamyq-nav">{nav}</div>
    </header>
  );
}
