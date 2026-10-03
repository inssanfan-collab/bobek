import Link from 'next/link';
import { LinkButton } from '@/components/site/Hero';
import { EnrollLink } from '@/components/site/theme-kit';
import { headerExtras } from '@/lib/hero';
import { pick } from '@/lib/i18n';
import type { ThemeHeaderProps } from '../types';
import { Kids, Mail, Phone, Pin } from './Doodles';

/**
 * Шапка «Жасыл» — по образцу №2: красно-оранжевая полоса с адресом,
 * почтой и телефоном в кружках, белая строка — знак с детьми и название
 * в два цвета, справа красная кнопка-капсула; меню строкой ниже.
 */
export function JasylHeader({ profile, sections, locale, homeHref, tools, nav }: ThemeHeaderProps) {
  const name = pick(locale, profile?.shortNameKk || profile?.nameKk, profile?.shortNameRu || profile?.nameRu) || 'Балабақша';
  const address = pick(locale, profile?.addressKk, profile?.addressRu);
  const extras = headerExtras(profile, locale);
  const [first, ...rest] = name.split(' ');

  return (
    <header className="site-header jasyl-header sticky top-0 z-40">
      <div className="jasyl-topbar">
        <div className="container-page flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-1.5 text-sm">
          <p className="hidden min-w-0 items-center gap-2 md:flex">
            {address ? <><span className="jasyl-dot"><Pin /></span><span className="truncate">{address}</span></> : null}
          </p>
          <p className="flex flex-wrap items-center gap-x-6 gap-y-1">
            {profile?.email ? (
              <a href={`mailto:${profile.email}`} className="flex items-center gap-2"><span className="jasyl-dot"><Mail /></span>{profile.email}</a>
            ) : null}
            {extras.phone ? (
              <a href={`tel:${extras.phone.replace(/[^\d+]/g, '')}`} className="flex items-center gap-2 font-bold"><span className="jasyl-dot"><Phone /></span>{extras.phone}</a>
            ) : null}
          </p>
        </div>
      </div>
      <div className="jasyl-row container-page">
        <Link href={homeHref} className="jasyl-brand">
          {profile?.logoMediaId ? (
            // eslint-disable-next-line @next/next/no-img-element -- файл отдаёт /api/media
            <img src={`/api/media/${profile.logoMediaId}`} alt="" className="h-12 w-12 shrink-0 object-contain" />
          ) : (
            <span className="jasyl-mark" aria-hidden><Kids /></span>
          )}
          <span className="jasyl-wordmark">
            <span className="jasyl-wordmark-a">{first}</span>
            {rest.length > 0 ? <span className="jasyl-wordmark-b"> {rest.join(' ')}</span> : null}
          </span>
        </Link>
        <div className="jasyl-side">
          <div className="jasyl-tools">{tools}</div>
          {extras.cta ? (
            <LinkButton link={extras.cta} className="jasyl-cta hidden lg:inline-flex" />
          ) : (
            <EnrollLink menu={sections} locale={locale} className="jasyl-cta hidden lg:inline-flex" />
          )}
        </div>
      </div>
      <div className="jasyl-nav">{nav}</div>
    </header>
  );
}
