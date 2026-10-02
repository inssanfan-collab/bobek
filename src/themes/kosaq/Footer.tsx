import { KitFooter } from '@/components/site/theme-kit';
import type { ThemeFooterProps } from '../types';

/** Подвал «Кемпірқосақ»: фиолетовый. */
export function KosaqFooter({ profile, sections, locale, portalDomain }: ThemeFooterProps) {
  return <KitFooter prefix="kosaq" profile={profile} sections={sections} locale={locale} portalDomain={portalDomain} />;
}
