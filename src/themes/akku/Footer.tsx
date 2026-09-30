import { SectionLinkList } from '@/components/site/blocks';
import { SocialLinks } from '@/components/site/SocialLinks';
import { pick } from '@/lib/i18n';
import type { ThemeFooterProps } from '../types';
import { Cloud, Ripple, Swan } from './Doodles';

const T = {
  contacts: { kk: 'Байланыс', ru: 'Контакты' },
  sections: { kk: 'Бөлімдер', ru: 'Разделы' },
  queue: { kk: 'Балабақшаға кезек (Darabala.kz)', ru: 'Очередь в детский сад (Darabala.kz)' },
  poweredBy: { kk: 'Сайт жасалған', ru: 'Сайт работает на платформе' },
} as const;

/** Подвал «Аққу»: сиренево-голубая вода с рябью сверху, облако и лебедь. */
export function AkkuFooter({ profile, sections, locale, portalDomain }: ThemeFooterProps) {
  const address = pick(locale, profile?.addressKk, profile?.addressRu);

  return (
    <footer className="akku-footer mt-10">
      <Ripple className="akku-footer-ripple" />
      <div className="akku-footer-body">
        <Cloud className="akku-doodle akku-footer-cloud" />
        <div className="container-page relative grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Swan round className="mb-3 h-16 w-16" />
            <p className="akku-footer-name font-display">{pick(locale, profile?.nameKk, profile?.nameRu)}</p>
            {address ? <p className="mt-2 text-sm">{address}</p> : null}
            {profile?.workHours ? <p className="mt-1 text-sm">{profile.workHours}</p> : null}
          </div>

          <div>
            <p className="akku-footer-title">{T.contacts[locale]}</p>
            <ul className="space-y-1.5 break-words text-sm">
              {profile?.phone ? (
                <li><a href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`} className="font-bold">{profile.phone}</a></li>
              ) : null}
              {profile?.phoneExtra ? <li>{profile.phoneExtra}</li> : null}
              {profile?.email ? <li><a href={`mailto:${profile.email}`}>{profile.email}</a></li> : null}
              <li>
                <a href="https://darabala.kz" target="_blank" rel="noopener noreferrer">{T.queue[locale]}</a>
              </li>
            </ul>
            <div className="mt-4">
              <SocialLinks profile={profile} locale={locale} withTitle={false} />
            </div>
          </div>

          <div>
            <p className="akku-footer-title">{T.sections[locale]}</p>
            <SectionLinkList sections={sections} locale={locale} className="space-y-1.5 text-sm" />
          </div>
        </div>

        <div className="akku-footer-bottom py-4 text-center text-sm">
          {T.poweredBy[locale]}{' '}
          <a href={`https://${portalDomain}`} target="_blank" rel="noopener noreferrer" className="font-bold">
            {portalDomain}
          </a>
        </div>
      </div>
    </footer>
  );
}
