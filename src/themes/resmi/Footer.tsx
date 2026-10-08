import { SectionLinkList } from '@/components/site/blocks';
import { SocialLinks } from '@/components/site/SocialLinks';
import { pick } from '@/lib/i18n';
import type { ThemeFooterProps } from '../types';

const T = {
  sections: { kk: 'Бөлімдер', ru: 'Разделы' },
  contacts: { kk: 'Байланыс', ru: 'Контакты' },
  bin: { kk: 'БСН', ru: 'БИН' },
  license: { kk: 'Лицензия', ru: 'Лицензия' },
  languages: { kk: 'Сайт қазақ және орыс тілдерінде жүргізіледі.', ru: 'Сайт ведётся на казахском и русском языках.' },
  top: { kk: 'Жоғары', ru: 'Наверх' },
  poweredBy: { kk: 'Сайт жасалған', ru: 'Сайт работает на платформе' },
} as const;

/** Подвал «Ресми»: тёмно-синий, с золотой линией; реквизиты — из паспорта сада, если заполнены. */
export function ResmiFooter({ profile, sections, locale, portalDomain }: ThemeFooterProps) {
  const name = pick(locale, profile?.nameKk, profile?.nameRu);
  const address = pick(locale, profile?.addressKk, profile?.addressRu);

  return (
    <footer className="resmi-footer mt-12">
      <div className="container-page grid gap-8 py-10 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <p className="resmi-footer-name">{name || 'Балабақша'}</p>
          {address ? <p className="mt-3 text-sm">{address}</p> : null}
          {profile?.bin ? <p className="mt-2 text-sm"><span className="resmi-footer-label">{T.bin[locale]}:</span> {profile.bin}</p> : null}
          {profile?.licenseNo ? <p className="mt-1 text-sm"><span className="resmi-footer-label">{T.license[locale]}:</span> {profile.licenseNo}</p> : null}
        </div>

        <div>
          <p className="resmi-footer-title">{T.sections[locale]}</p>
          <SectionLinkList sections={sections} locale={locale} className="space-y-1.5 text-sm" limit={10} />
        </div>

        <div>
          <p className="resmi-footer-title">{T.contacts[locale]}</p>
          <ul className="space-y-1.5 break-words text-sm">
            {profile?.phone ? (
              <li><a href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`} className="font-semibold">{profile.phone}</a></li>
            ) : null}
            {profile?.phoneExtra ? <li>{profile.phoneExtra}</li> : null}
            {profile?.email ? <li><a href={`mailto:${profile.email}`}>{profile.email}</a></li> : null}
            {profile?.workHours ? <li>{profile.workHours}</li> : null}
          </ul>
          <div className="resmi-footer-social mt-4">
            <SocialLinks profile={profile} locale={locale} withTitle={false} />
          </div>
          <p className="mt-4 text-sm opacity-80">{T.languages[locale]}</p>
        </div>
      </div>

      <div className="resmi-footer-bottom">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
          <p>
            © {new Date().getFullYear()} {name} · {T.poweredBy[locale]}{' '}
            <a href={`https://${portalDomain}`} target="_blank" rel="noopener noreferrer" className="font-semibold">{portalDomain}</a>
          </p>
          <a href="#" className="resmi-top">↑ {T.top[locale]}</a>
        </div>
      </div>
    </footer>
  );
}
