import { KitHeader } from '@/components/site/theme-kit';
import type { ThemeHeaderProps } from '../types';

/** Знак «Гүлдер»: цветок. */
function Flower() {
  return (
    <svg className="decor h-10 w-10" viewBox="0 0 40 40" aria-hidden>
      <g fill="#F7A8CB">
        <circle cx="20" cy="10" r="6" />
        <circle cx="29.5" cy="17" r="6" />
        <circle cx="26" cy="28" r="6" />
        <circle cx="14" cy="28" r="6" />
        <circle cx="10.5" cy="17" r="6" />
      </g>
      <circle cx="20" cy="20" r="5.5" fill="#B81C6B" />
    </svg>
  );
}

/** Шапка «Гүлдер»: белая, цветок вместо логотипа, фиолетовая кнопка. */
export function GulderHeader({ profile, sections, locale, homeHref, tools, nav }: ThemeHeaderProps) {
  return (
    <KitHeader prefix="gulder" profile={profile} locale={locale} homeHref={homeHref} tools={tools} nav={nav} menu={sections} logoFallback={<Flower />} />
  );
}
