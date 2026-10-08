import { SectionLinkList } from '@/components/site/blocks';
import { SocialLinks } from '@/components/site/SocialLinks';
import { pick } from '@/lib/i18n';
import type { ThemeFooterProps } from '../types';

const T = {
  poweredBy: { kk: 'Сайт жасалған', ru: 'Сайт работает на платформе' },
  top: { kk: 'Жоғары', ru: 'Наверх' },
} as const;

/**
 * Подвал «Нұр» — красная полоса, как в образце №7: разделы строкой,
 * соцсети и копирайт. Контакты и карта — на главной.
 */
export function NurFooter({ profile, sections, locale, portalDomain }: ThemeFooterProps) {
  const name = pick(locale, profile?.nameKk, profile?.nameRu) || 'Балабақша';

  return (
    <footer className="nur-footer">
      <div className="container-page flex flex-col items-center gap-4 py-7 text-center text-sm">
        <SectionLinkList sections={sections} locale={locale} limit={12} className="nur-footer-links" />
        <div className="nur-footer-social"><SocialLinks profile={profile} locale={locale} withTitle={false} /></div>
        <p>
          © {new Date().getFullYear()} {name} · {T.poweredBy[locale]}{' '}
          <a href={`https://${portalDomain}`} target="_blank" rel="noopener noreferrer" className="nur-footer-portal">{portalDomain}</a>
          {' · '}
          <a href="#" className="font-bold">↑ {T.top[locale]}</a>
        </p>
      </div>
    </footer>
  );
}
