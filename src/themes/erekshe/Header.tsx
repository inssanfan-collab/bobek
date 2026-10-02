import { KitHeader } from '@/components/site/theme-kit';
import type { ThemeHeaderProps } from '../types';
import { Mark } from './Doodles';

/** Шапка «Ерекше»: белая, знак с ростком вместо логотипа, оранжевая кнопка записи. */
export function ErekshHeader({ profile, sections, locale, homeHref, tools, nav }: ThemeHeaderProps) {
  return (
    <KitHeader
      prefix="erekshe"
      profile={profile}
      locale={locale}
      homeHref={homeHref}
      tools={tools}
      nav={nav}
      menu={sections}
      logoFallback={<Mark className="h-10 w-10" />}
    />
  );
}
