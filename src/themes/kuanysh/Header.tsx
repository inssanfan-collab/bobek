import { KitHeader } from '@/components/site/theme-kit';
import type { ThemeHeaderProps } from '../types';

/** Знак «Қуаныш»: жёлтое солнышко на фиолетовом. */
function Mark() {
  return (
    <svg className="decor h-10 w-10" viewBox="0 0 40 40" aria-hidden>
      <circle cx="20" cy="20" r="19" fill="#FFD84D" />
      <circle cx="20" cy="20" r="8" fill="none" stroke="#6A3DD1" strokeWidth="3" />
      <path d="M20 5v5M20 30v5M5 20h5M30 20h5M9.4 9.4l3.5 3.5M27.1 27.1l3.5 3.5M9.4 30.6l3.5-3.5M27.1 12.9l3.5-3.5" stroke="#6A3DD1" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/** Шапка «Қуаныш»: светлая, красно-оранжевая кнопка записи. */
export function KuanyshHeader({ profile, sections, locale, homeHref, tools, nav }: ThemeHeaderProps) {
  return (
    <KitHeader prefix="kuanysh" profile={profile} locale={locale} homeHref={homeHref} tools={tools} nav={nav} menu={sections} logoFallback={<Mark />} />
  );
}
