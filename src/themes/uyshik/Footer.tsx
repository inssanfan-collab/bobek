import { SectionLinkList } from '@/components/site/blocks';
import { SocialLinks } from '@/components/site/SocialLinks';
import { pick } from '@/lib/i18n';
import type { ThemeFooterProps } from '../types';
import { Mark } from './Doodles';

const T = {
  sections: { kk: 'Бөлімдер', ru: 'Разделы' },
  contacts: { kk: 'Байланыс', ru: 'Контакты' },
  poweredBy: { kk: 'Сайт жасалған', ru: 'Сайт работает на платформе' },
  top: { kk: 'Жоғары', ru: 'Наверх' },
} as const;

/** Подвал «Үйшік»: тёмная земля под двором, внизу знак-домик и название сада. */
export function UyshikFooter({ profile, sections, locale, portalDomain }: ThemeFooterProps) {
  const name = pick(locale, profile?.nameKk, profile?.nameRu);
  const address = pick(locale, profile?.addressKk, profile?.addressRu);

  return (
    <footer className="uyshik-footer">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Mark className="mb-3 h-14 w-14" />
          <p className="uyshik-footer-name">{name || 'Балабақша'}</p>
          {address ? <p className="mt-3 text-sm">{address}</p> : null}
          {profile?.workHours ? <p className="mt-1 text-sm">{profile.workHours}</p> : null}
        </div>
        <div>
          <p className="uyshik-footer-title">{T.sections[locale]}</p>
          <SectionLinkList sections={sections} locale={locale} className="space-y-1.5 text-sm" />
        </div>
        <div>
          <p className="uyshik-footer-title">{T.contacts[locale]}</p>
          <ul className="space-y-1.5 break-words text-sm">
            {profile?.phone ? <li><a href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`} className="font-bold">{profile.phone}</a></li> : null}
            {profile?.phoneExtra ? <li>{profile.phoneExtra}</li> : null}
            {profile?.email ? <li><a href={`mailto:${profile.email}`}>{profile.email}</a></li> : null}
          </ul>
          <div className="uyshik-footer-social mt-4">
            <SocialLinks profile={profile} locale={locale} withTitle={false} />
          </div>
        </div>
      </div>
      <div className="uyshik-footer-bottom">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
          <p>
            {T.poweredBy[locale]}{' '}
            <a href={`https://${portalDomain}`} target="_blank" rel="noopener noreferrer" className="font-bold">{portalDomain}</a>
          </p>
          <a href="#" className="font-bold">↑ {T.top[locale]}</a>
        </div>
      </div>
    </footer>
  );
}
