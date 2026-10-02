import { KitFooter } from '@/components/site/theme-kit';
import type { ThemeFooterProps } from '../types';

/** Подвал «Күнбағыс»: тёмно-оранжевый. */
export function KunbagysFooter({ profile, sections, locale, portalDomain }: ThemeFooterProps) {
  return <KitFooter prefix="kunbagys" profile={profile} sections={sections} locale={locale} portalDomain={portalDomain} />;
}
