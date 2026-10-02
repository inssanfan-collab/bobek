import { KitHeader } from '@/components/site/theme-kit';
import type { ThemeHeaderProps } from '../types';
import { SunFace } from './Doodles';

/** Шапка «Аспан»: белая, улыбающееся солнце вместо логотипа, жёлтая кнопка. */
export function AspanHeader({ profile, sections, locale, homeHref, tools, nav }: ThemeHeaderProps) {
  return (
    <KitHeader prefix="aspan" profile={profile} locale={locale} homeHref={homeHref} tools={tools} nav={nav} menu={sections} logoFallback={<SunFace className="h-11 w-11" />} />
  );
}
