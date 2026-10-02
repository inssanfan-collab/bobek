import { KitFooter } from '@/components/site/theme-kit';
import type { ThemeFooterProps } from '../types';

/** Подвал «Жасыл»: тёмно-зелёный. */
export function JasylFooter({ profile, sections, locale, portalDomain }: ThemeFooterProps) {
  return <KitFooter prefix="jasyl" profile={profile} sections={sections} locale={locale} portalDomain={portalDomain} />;
}
