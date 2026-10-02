import { KitHeader } from '@/components/site/theme-kit';
import type { ThemeHeaderProps } from '../types';

/** Знак «Мамық»: сердечко в пудровом круге. */
function Heart() {
  return (
    <svg className="decor h-10 w-10" viewBox="0 0 40 40" aria-hidden>
      <circle cx="20" cy="20" r="19" fill="#FFE3EA" />
      <path d="M20 29c-6-4-9.5-7.6-9.5-11.6 0-2.7 2.1-4.7 4.6-4.7 2 0 3.8 1.2 4.9 3 1.1-1.8 2.9-3 4.9-3 2.5 0 4.6 2 4.6 4.7 0 4-3.5 7.6-9.5 11.6Z" fill="#B8325A" />
    </svg>
  );
}

/** Шапка «Мамық»: светлая, сердечко вместо логотипа, малиновая кнопка. */
export function MamyqHeader({ profile, sections, locale, homeHref, tools, nav }: ThemeHeaderProps) {
  return (
    <KitHeader prefix="mamyq" profile={profile} locale={locale} homeHref={homeHref} tools={tools} nav={nav} menu={sections} logoFallback={<Heart />} />
  );
}
