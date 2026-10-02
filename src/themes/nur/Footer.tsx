import { KitFooter } from '@/components/site/theme-kit';
import type { ThemeFooterProps } from '../types';

/** Подвал «Нұр»: красный. */
export function NurFooter({ profile, sections, locale, portalDomain }: ThemeFooterProps) {
  return <KitFooter prefix="nur" profile={profile} sections={sections} locale={locale} portalDomain={portalDomain} />;
}
