import { KitFooter } from '@/components/site/theme-kit';
import type { ThemeFooterProps } from '../types';
import { Wave } from './Doodles';

/** Подвал «Шуақ»: тёмная бирюза с волной сверху. */
export function ShuaqFooter({ profile, sections, locale, portalDomain }: ThemeFooterProps) {
  return (
    <KitFooter
      prefix="shuaq"
      profile={profile}
      sections={sections}
      locale={locale}
      portalDomain={portalDomain}
      top={<Wave className="shuaq-footer-wave" />}
    />
  );
}
