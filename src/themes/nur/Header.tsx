import { KitHeader } from '@/components/site/theme-kit';
import type { ThemeHeaderProps } from '../types';

/** Знак «Нұр»: солнышко в тёплом круге. */
function Mark() {
  return (
    <svg className="decor h-10 w-10" viewBox="0 0 40 40" aria-hidden>
      <circle cx="20" cy="20" r="19" fill="#F6B93B" />
      <circle cx="20" cy="20" r="7" fill="#fff" />
      <path d="M20 6v5M20 29v5M6 20h5M29 20h5M10.1 10.1l3.5 3.5M26.4 26.4l3.5 3.5M10.1 29.9l3.5-3.5M26.4 13.6l3.5-3.5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/** Шапка «Нұр»: кремовая, название рукописным шрифтом, красная кнопка. */
export function NurHeader({ profile, sections, locale, homeHref, tools, nav }: ThemeHeaderProps) {
  return (
    <KitHeader prefix="nur" profile={profile} locale={locale} homeHref={homeHref} tools={tools} nav={nav} menu={sections} logoFallback={<Mark />} />
  );
}
