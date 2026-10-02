import { KitHeader } from '@/components/site/theme-kit';
import type { ThemeHeaderProps } from '../types';
import { Sun } from './Doodles';

/** Шапка «Шуақ»: белая, солнышко вместо логотипа, коралловая кнопка записи. */
export function ShuaqHeader({ profile, sections, locale, homeHref, tools, nav }: ThemeHeaderProps) {
  return (
    <KitHeader
      prefix="shuaq"
      profile={profile}
      locale={locale}
      homeHref={homeHref}
      tools={tools}
      nav={nav}
      menu={sections}
      logoFallback={<Sun className="h-10 w-10" />}
    />
  );
}
