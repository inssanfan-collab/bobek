import { SectionLinkList } from '@/components/site/blocks';
import { SocialLinks } from '@/components/site/SocialLinks';
import { pick } from '@/lib/i18n';
import type { ThemeFooterProps } from '../types';

const T = {
  sections: { kk: 'Бөлімдер', ru: 'Разделы' },
  contacts: { kk: 'Байланыс', ru: 'Контакты' },
  queue: { kk: 'Балабақшаға кезек (Darabala.kz)', ru: 'Очередь в детский сад (Darabala.kz)' },
  poweredBy: { kk: 'Сайт жасалған', ru: 'Сайт работает на платформе' },
  top: { kk: 'Жоғары', ru: 'Наверх' },
} as const;

/** Подвал «Кітап»: кобальт, название сада громадным контуром, три колонки ниже. */
export function KitapFooter({ profile, sections, locale, portalDomain }: ThemeFooterProps) {
  const name = pick(locale, profile?.nameKk, profile?.nameRu);
  const address = pick(locale, profile?.addressKk, profile?.addressRu);

  return (
    <footer className="kitap-footer">
      <div className="container-page py-12">
        <p className="kitap-footer-name">{name || 'Балабақша'}</p>
        <div className="kitap-footer-grid">
          <div>
            {address ? <p className="text-sm leading-relaxed">{address}</p> : null}
            {profile?.workHours ? <p className="mt-2 text-sm">{profile.workHours}</p> : null}
          </div>
          <div>
            <p className="kitap-footer-title">{T.sections[locale]}</p>
            <SectionLinkList sections={sections} locale={locale} className="space-y-1.5 text-sm" limit={8} />
          </div>
          <div>
            <p className="kitap-footer-title">{T.contacts[locale]}</p>
            <ul className="space-y-1.5 break-words text-sm">
              {profile?.phone ? <li><a href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`} className="font-semibold">{profile.phone}</a></li> : null}
              {profile?.phoneExtra ? <li>{profile.phoneExtra}</li> : null}
              {profile?.email ? <li><a href={`mailto:${profile.email}`}>{profile.email}</a></li> : null}
              <li><a href="https://darabala.kz" target="_blank" rel="noopener noreferrer">{T.queue[locale]}</a></li>
            </ul>
            <div className="kitap-footer-social mt-4">
              <SocialLinks profile={profile} locale={locale} withTitle={false} />
            </div>
          </div>
        </div>
      </div>
      <div className="kitap-footer-bottom">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
          <p>
            {T.poweredBy[locale]}{' '}
            <a href={`https://${portalDomain}`} target="_blank" rel="noopener noreferrer" className="font-semibold">{portalDomain}</a>
          </p>
          <a href="#" className="font-semibold">↑ {T.top[locale]}</a>
        </div>
      </div>
    </footer>
  );
}
