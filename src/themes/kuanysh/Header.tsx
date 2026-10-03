import Link from 'next/link';
import { LinkButton } from '@/components/site/Hero';
import { EnrollLink } from '@/components/site/theme-kit';
import { headerExtras } from '@/lib/hero';
import { pick } from '@/lib/i18n';
import type { ThemeHeaderProps } from '../types';
import { Icon, Mark } from './Doodles';

/**
 * Шапка «Қуаныш» — по образцу №4: красная полоса с почтой и телефоном
 * в белых кружках, под ней белая строка со скруглёнными углами — знак,
 * название, меню с тонкими разделителями и красная кнопка-капсула.
 */
export function KuanyshHeader({ profile, sections, locale, homeHref, tools, nav }: ThemeHeaderProps) {
  const name = pick(locale, profile?.shortNameKk || profile?.nameKk, profile?.shortNameRu || profile?.nameRu) || 'Балабақша';
  const extras = headerExtras(profile, locale);
  const tagline = extras.tagline;

  return (
    <header className="site-header kuanysh-header sticky top-0 z-40">
      <div className="kuanysh-topbar">
        <p className="container-page flex flex-wrap items-center gap-x-7 gap-y-1 py-1.5 text-sm">
          {profile?.email ? (
            <a href={`mailto:${profile.email}`} className="flex items-center gap-2"><span className="kuanysh-dot"><Icon name="mail" className="h-3.5 w-3.5" /></span>{profile.email}</a>
          ) : null}
          {extras.phone ? (
            <a href={`tel:${extras.phone.replace(/[^\d+]/g, '')}`} className="flex items-center gap-2 font-bold"><span className="kuanysh-dot"><Icon name="phone" className="h-3.5 w-3.5" /></span>{extras.phone}</a>
          ) : null}
        </p>
      </div>
      <div className="kuanysh-sheet">
        <div className="kuanysh-row container-page">
          <Link href={homeHref} className="kuanysh-brand">
            {profile?.logoMediaId ? (
              // eslint-disable-next-line @next/next/no-img-element -- файл отдаёт /api/media
              <img src={`/api/media/${profile.logoMediaId}`} alt="" className="h-12 w-12 shrink-0 object-contain" />
            ) : (
              <span className="kuanysh-mark" aria-hidden><Mark /></span>
            )}
            <span className="min-w-0">
              <span className="kuanysh-name">{name}</span>
              {tagline ? <span className="kuanysh-tagline">{tagline}</span> : null}
            </span>
          </Link>
          <div className="kuanysh-side">
            <div className="kuanysh-tools">{tools}</div>
            {extras.cta ? (
              <LinkButton link={extras.cta} className="kuanysh-cta" />
            ) : (
              <EnrollLink menu={sections} locale={locale} className="kuanysh-cta" />
            )}
          </div>
        </div>
        <div className="kuanysh-nav">{nav}</div>
      </div>
    </header>
  );
}
