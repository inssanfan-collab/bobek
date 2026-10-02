import { KitHeader } from '@/components/site/theme-kit';
import type { ThemeHeaderProps } from '../types';

/** Знак «Күнбағыс»: подсолнух. */
function Sunflower() {
  return (
    <svg className="decor h-10 w-10" viewBox="0 0 40 40" aria-hidden>
      <g fill="#FFB020">
        {Array.from({ length: 12 }, (_, index) => (
          <ellipse key={index} cx="20" cy="7.5" rx="3.2" ry="6.5" transform={`rotate(${index * 30} 20 20)`} />
        ))}
      </g>
      <circle cx="20" cy="20" r="7.5" fill="#6B3A12" />
    </svg>
  );
}

/** Шапка «Күнбағыс»: белая с оранжевой линией сверху, оранжевая кнопка. */
export function KunbagysHeader({ profile, sections, locale, homeHref, tools, nav }: ThemeHeaderProps) {
  return (
    <KitHeader prefix="kunbagys" profile={profile} locale={locale} homeHref={homeHref} tools={tools} nav={nav} menu={sections} logoFallback={<Sunflower />} />
  );
}
