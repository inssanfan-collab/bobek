import { SectionLinkList } from '@/components/site/blocks';
import { pick } from '@/lib/i18n';
import type { ThemeFooterProps } from '../types';

const T = {
  queue: { kk: 'Балабақшаға кезек (Darabala.kz)', ru: 'Очередь в детский сад (Darabala.kz)' },
  poweredBy: { kk: 'Сайт жасалған', ru: 'Сайт работает на платформе' },
  top: { kk: 'Жоғары', ru: 'Наверх' },
} as const;

/**
 * Подвал «Ерекше» — лёгкий, как в образце №6: тонкая тёмная линия,
 * разделы строкой и копирайт по центру. Контакты и карта — на главной.
 */
export function ErekshFooter({ profile, sections, locale, portalDomain }: ThemeFooterProps) {
  const name = pick(locale, profile?.nameKk, profile?.nameRu) || 'Балабақша';

  return (
    <footer className="erekshe-footer">
      <div className="container-page py-8 text-center">
        <SectionLinkList sections={sections} locale={locale} limit={12} className="erekshe-footer-links text-sm" />
        <p className="mt-5 text-sm">
          <a href="https://darabala.kz" target="_blank" rel="noopener noreferrer">{T.queue[locale]}</a>
        </p>
        <p className="mt-3 text-sm">
          © {new Date().getFullYear()} {name} · {T.poweredBy[locale]}{' '}
          <a href={`https://${portalDomain}`} target="_blank" rel="noopener noreferrer" className="erekshe-footer-portal">{portalDomain}</a>
          {' · '}
          <a href="#" className="font-bold">↑ {T.top[locale]}</a>
        </p>
      </div>
    </footer>
  );
}
