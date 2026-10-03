import { SectionLinkList } from '@/components/site/blocks';
import { SocialLinks } from '@/components/site/SocialLinks';
import { pick } from '@/lib/i18n';
import type { ThemeFooterProps } from '../types';

const T = {
  contacts: { kk: 'Байланыс', ru: 'Контакты' },
  queue: { kk: 'Балабақшаға кезек (Darabala.kz)', ru: 'Очередь в детский сад (Darabala.kz)' },
  poweredBy: { kk: 'Сайт жасалған', ru: 'Сайт работает на платформе' },
  top: { kk: 'Жоғары', ru: 'Наверх' },
} as const;

/**
 * Подвал «Күнбағыс» — как в образце №10: светлая строка с разделами
 * и контактами, ниже оранжевая полоса с копирайтом.
 */
export function KunbagysFooter({ profile, sections, locale, portalDomain }: ThemeFooterProps) {
  const name = pick(locale, profile?.nameKk, profile?.nameRu) || 'Балабақша';
  const address = pick(locale, profile?.addressKk, profile?.addressRu);

  return (
    <footer className="kunbagys-footer">
      <div className="container-page grid gap-8 py-10 md:grid-cols-[1.4fr_1fr]">
        <SectionLinkList sections={sections} locale={locale} limit={12} className="kunbagys-footer-links text-sm" />
        <div className="text-sm">
          <p className="kunbagys-footer-title">{T.contacts[locale]}</p>
          <ul className="space-y-1">
            {address ? <li>{address}</li> : null}
            {profile?.phone ? <li><a href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`} className="font-bold">{profile.phone}</a></li> : null}
            {profile?.email ? <li><a href={`mailto:${profile.email}`} className="break-all">{profile.email}</a></li> : null}
            {profile?.workHours ? <li>{profile.workHours}</li> : null}
            <li><a href="https://darabala.kz" target="_blank" rel="noopener noreferrer">{T.queue[locale]}</a></li>
          </ul>
          <div className="kunbagys-footer-social mt-4"><SocialLinks profile={profile} locale={locale} withTitle={false} /></div>
        </div>
      </div>
      <div className="kunbagys-footer-bottom">
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
