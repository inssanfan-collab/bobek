import { KitFooter } from '@/components/site/theme-kit';
import type { ThemeFooterProps } from '../types';
import { CloudEdge } from './Doodles';

/** Подвал «Аспан»: тёмно-синий, облака сверху. */
export function AspanFooter({ profile, sections, locale, portalDomain }: ThemeFooterProps) {
  return (
    <KitFooter prefix="aspan" profile={profile} sections={sections} locale={locale} portalDomain={portalDomain} top={<CloudEdge className="aspan-footer-edge" />} />
  );
}
