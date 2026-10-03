import Link from 'next/link';
import { LinkButton } from '@/components/site/Hero';
import { headerExtras } from '@/lib/hero';
import { pick } from '@/lib/i18n';
import type { ThemeHeaderProps } from '../types';

/** Цвета букв названия — как разноцветный логотип; все с контрастом от 3:1 на белом. */
const LETTERS = ['#D61C6B', '#C2410C', '#15803D', '#1D4ED8', '#7E22CE'];

/**
 * Шапка «Шуақ»: розовая полоса с телефоном и часами (если сад их включил),
 * белая строка — название разноцветными буквами слева, меню справа в той же
 * строке, кнопки для слабовидящих и язык. На телефоне меню уходит вниз.
 */
export function ShuaqHeader({ profile, locale, homeHref, tools, nav }: ThemeHeaderProps) {
  const name = pick(locale, profile?.shortNameKk || profile?.nameKk, profile?.shortNameRu || profile?.nameRu) || 'Балабақша';
  const extras = headerExtras(profile, locale);
  let colorIndex = 0;

  return (
    <header className="site-header shuaq-header sticky top-0 z-40">
      {extras.phone || extras.hours ? (
        <div className="shuaq-topbar">
          <p className="container-page flex flex-wrap items-center gap-x-6 gap-y-1 py-1.5 text-sm">
            {extras.phone ? <a href={`tel:${extras.phone.replace(/[^\d+]/g, '')}`} className="font-bold">☏ {extras.phone}</a> : null}
            {extras.hours ? <span>◷ {extras.hours}</span> : null}
          </p>
        </div>
      ) : null}
      <div className="shuaq-row container-page">
        <Link href={homeHref} className="shuaq-brand">
          {profile?.logoMediaId ? (
            // eslint-disable-next-line @next/next/no-img-element -- файл отдаёт /api/media
            <img src={`/api/media/${profile.logoMediaId}`} alt="" className="h-12 w-12 shrink-0 rounded-full object-contain" />
          ) : null}
          <span className="sr-only">{name}</span>
          <span className="shuaq-wordmark" aria-hidden>
            {[...name].map((char, index) => {
              if (char.trim() === '') return <span key={index}> </span>;
              const color = LETTERS[colorIndex % LETTERS.length];
              colorIndex += 1;
              return <span key={index} style={{ color }}>{char}</span>;
            })}
          </span>
        </Link>
        <div className="shuaq-nav">{nav}</div>
        <div className="shuaq-side">
          {extras.cta ? <LinkButton link={extras.cta} className="shuaq-cta btn hidden xl:inline-flex" /> : null}
          <div className="shuaq-tools">{tools}</div>
        </div>
      </div>
    </header>
  );
}
