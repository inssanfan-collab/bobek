import { KitFooter } from '@/components/site/theme-kit';
import type { ThemeFooterProps } from '../types';

/** Подвал «Мамық»: светлый, пудровый. */
export function MamyqFooter({ profile, sections, locale, portalDomain }: ThemeFooterProps) {
  return <KitFooter prefix="mamyq" profile={profile} sections={sections} locale={locale} portalDomain={portalDomain} />;
}
