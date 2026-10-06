import Link from 'next/link';
import { LinkButton } from '@/components/site/Hero';
import { EnrollLink } from '@/components/site/theme-kit';
import { headerExtras } from '@/lib/hero';
import { pick } from '@/lib/i18n';
import type { ThemeHeaderProps } from '../types';

/**
 * Шапка «Кітап»: белая полоса между двумя чёрными линиями, как набор афиши.
 * Слева название сада сжатым жирным шрифтом, справа жёлтая кнопка с жёсткой
 * тенью, язык и версия для слабовидящих. Меню — второй строкой, без капса.
 */
export function KitapHeader({ profile, sections, locale, homeHref, tools, nav }: ThemeHeaderProps) {
  const name = pick(locale, profile?.shortNameKk || profile?.nameKk, profile?.shortNameRu || profile?.nameRu) || 'Балабақша';
  const extras = headerExtras(profile, locale);

  return (
    <header className="site-header kitap-header sticky top-0 z-40">
      <div className="container-page flex items-center gap-3 py-2.5 sm:gap-5">
        <Link href={homeHref} className="kitap-brand flex min-w-0 items-center gap-3">
          {profile?.logoMediaId ? (
            // eslint-disable-next-line @next/next/no-img-element -- файл отдаёт /api/media
            <img src={`/api/media/${profile.logoMediaId}`} alt="" className="kitap-logo h-11 w-11 shrink-0 object-contain" />
          ) : (
            <span className="kitap-logo kitap-logo-empty grid h-11 w-11 shrink-0 place-items-center" aria-hidden>
              {name.replace(/[^A-Za-zА-Яа-яӘәҒғҚқҢңӨөҰұҮүҺһІі]/g, '').charAt(0)}
            </span>
          )}
          <span className="min-w-0">
            <span className="kitap-name block truncate">{name}</span>
            {extras.phone ? <span className="kitap-tagline block truncate">{extras.phone}{extras.hours ? ` · ${extras.hours}` : ''}</span> : extras.tagline ? <span className="kitap-tagline block truncate">{extras.tagline}</span> : null}
          </span>
        </Link>
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          {extras.cta ? (
            <LinkButton link={extras.cta} className="kitap-cta hidden shrink-0 lg:inline-flex" />
          ) : (
            <EnrollLink menu={sections} locale={locale} className="kitap-cta hidden shrink-0 lg:inline-flex" />
          )}
          <div className="kitap-tools flex shrink-0 items-center gap-1">{tools}</div>
        </div>
      </div>
      <div className="kitap-nav">{nav}</div>
    </header>
  );
}
