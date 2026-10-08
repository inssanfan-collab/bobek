import { SectionLinkList } from '@/components/site/blocks';
import { SocialLinks } from '@/components/site/SocialLinks';
import { pick } from '@/lib/i18n';
import type { ThemeFooterProps } from '../types';

const T = {
  poweredBy: { kk: 'Сайт жасалған', ru: 'Сайт работает на платформе' },
  top: { kk: 'Жоғары', ru: 'Наверх' },
} as const;

/**
 * Подвал «Гүлдер» — малиновый, как в образце №8: название крупно
 * слева, адрес и контакты справа, разделы строкой; внизу — фиолетовая
 * полоса.
 */
export function GulderFooter({ profile, sections, locale, portalDomain }: ThemeFooterProps) {
  const name = pick(locale, profile?.nameKk, profile?.nameRu) || 'Балабақша';
  const address = pick(locale, profile?.addressKk, profile?.addressRu);

  return (
    <footer className="gulder-footer">
      <div className="container-page gulder-footer-top">
        <p className="gulder-footer-name">{name}</p>
        <ul className="gulder-footer-contacts">
          {address ? <li>{address}</li> : null}
          {profile?.phone ? <li><a href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`} className="font-bold">{profile.phone}</a></li> : null}
          {profile?.email ? <li><a href={`mailto:${profile.email}`}>{profile.email}</a></li> : null}
        </ul>
      </div>
      <div className="container-page flex flex-wrap items-center justify-between gap-4 pb-8">
        <SectionLinkList sections={sections} locale={locale} limit={12} className="gulder-footer-links text-sm" />
        <div className="gulder-footer-social"><SocialLinks profile={profile} locale={locale} withTitle={false} /></div>
      </div>
      <div className="gulder-footer-bottom">
        <p className="container-page py-3 text-center text-sm">
          © {new Date().getFullYear()} {name} · {T.poweredBy[locale]}{' '}
          <a href={`https://${portalDomain}`} target="_blank" rel="noopener noreferrer" className="font-bold">{portalDomain}</a>
          {' · '}
          <a href="#" className="font-bold">↑ {T.top[locale]}</a>
        </p>
      </div>
    </footer>
  );
}
