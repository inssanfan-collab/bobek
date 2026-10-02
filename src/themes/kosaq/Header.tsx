import { KitHeader } from '@/components/site/theme-kit';
import type { ThemeHeaderProps } from '../types';
import { Rainbow } from './Doodles';

/** Шапка «Кемпірқосақ»: белая, радуга вместо логотипа. */
export function KosaqHeader({ profile, sections, locale, homeHref, tools, nav }: ThemeHeaderProps) {
  return (
    <KitHeader prefix="kosaq" profile={profile} locale={locale} homeHref={homeHref} tools={tools} nav={nav} menu={sections} logoFallback={<Rainbow className="h-8 w-12" />} />
  );
}
