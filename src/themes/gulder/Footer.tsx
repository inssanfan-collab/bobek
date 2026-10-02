import { KitFooter } from '@/components/site/theme-kit';
import type { ThemeFooterProps } from '../types';

/** Подвал «Гүлдер»: малиново-фиолетовый градиент. */
export function GulderFooter({ profile, sections, locale, portalDomain }: ThemeFooterProps) {
  return <KitFooter prefix="gulder" profile={profile} sections={sections} locale={locale} portalDomain={portalDomain} />;
}
