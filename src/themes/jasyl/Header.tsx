import { KitHeader } from '@/components/site/theme-kit';
import type { ThemeHeaderProps } from '../types';

/** Знак «Жасыл»: зелёный круг с листком. */
function Leaf() {
  return (
    <svg className="decor h-9 w-9" viewBox="0 0 40 40" aria-hidden>
      <circle cx="20" cy="20" r="19" fill="#17794A" />
      <path d="M13 27c0-9 6-14 15-14 0 9-6 14-15 14Zm0 0 8-8" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Шапка «Жасыл»: белая, розовая кнопка записи. */
export function JasylHeader({ profile, sections, locale, homeHref, tools, nav }: ThemeHeaderProps) {
  return (
    <KitHeader prefix="jasyl" profile={profile} locale={locale} homeHref={homeHref} tools={tools} nav={nav} menu={sections} logoFallback={<Leaf />} />
  );
}
