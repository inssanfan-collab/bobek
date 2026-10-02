import { KitFooter } from '@/components/site/theme-kit';
import type { ThemeFooterProps } from '../types';

/** Подвал «Қуаныш»: фиолетовый. */
export function KuanyshFooter({ profile, sections, locale, portalDomain }: ThemeFooterProps) {
  return <KitFooter prefix="kuanysh" profile={profile} sections={sections} locale={locale} portalDomain={portalDomain} />;
}
