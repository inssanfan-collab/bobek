import { KitFooter } from '@/components/site/theme-kit';
import type { ThemeFooterProps } from '../types';

/** Подвал «Ерекше»: светлый, на голубоватом фоне. */
export function ErekshFooter({ profile, sections, locale, portalDomain }: ThemeFooterProps) {
  return <KitFooter prefix="erekshe" profile={profile} sections={sections} locale={locale} portalDomain={portalDomain} />;
}
