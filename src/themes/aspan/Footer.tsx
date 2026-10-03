import { SectionLinkList } from '@/components/site/blocks';
import { SocialLinks } from '@/components/site/SocialLinks';
import { pick } from '@/lib/i18n';
import type { ThemeFooterProps } from '../types';
import { Sun } from './Doodles';

const T = {
  sections: { kk: 'Бөлімдер', ru: 'Разделы' },
  contacts: { kk: 'Байланыс', ru: 'Контакты' },
  queue: { kk: 'Балабақшаға кезек (Darabala.kz)', ru: 'Очередь в детский сад (Darabala.kz)' },
  poweredBy: { kk: 'Сайт жасалған', ru: 'Сайт работает на платформе' },
  top: { kk: 'Жоғары', ru: 'Наверх' },
} as const;

/**
 * Подвал «Аспан» — фиолетовый, как в образце №3: знак и название, разделы
 * двумя колонками под подчёркнутым заголовком, контакты; внизу —
 * строка с копирайтом и соцсетями.
 */
export function AspanFooter({ profile, sections, locale, portalDomain }: ThemeFooterProps) {
  const name = pick(locale, profile?.nameKk, profile?.nameRu) || 'Балабақша';
  const address = pick(locale, profile?.addressKk, profile?.addressRu);

  return (
    <footer className="aspan-footer">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1fr_1.4fr_1.1fr]">
        <div>
          <p className="flex items-center gap-3">
            <span className="aspan-footer-mark" aria-hidden><Sun className="h-full w-full" /></span>
            <span className="aspan-footer-name">{name}</span>
          </p>
          {profile?.workHours ? <p className="mt-4 text-sm">{profile.workHours}</p> : null}
        </div>
        <div>
          <p className="aspan-footer-title">{T.sections[locale]}</p>
          <SectionLinkList sections={sections} locale={locale} limit={12} className="aspan-footer-links text-sm" />
        </div>
        <div>
          <p className="aspan-footer-title">{T.contacts[locale]}</p>
          <ul className="space-y-2 break-words text-sm">
            {address ? <li>{address}</li> : null}
            {profile?.phone ? <li><a href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`} className="font-bold">{profile.phone}</a></li> : null}
            {profile?.email ? <li><a href={`mailto:${profile.email}`}>{profile.email}</a></li> : null}
            <li><a href="https://darabala.kz" target="_blank" rel="noopener noreferrer">{T.queue[locale]}</a></li>
          </ul>
        </div>
      </div>
      <div className="container-page aspan-footer-bottom">
        <p>
          © {new Date().getFullYear()} {name} · {T.poweredBy[locale]}{' '}
          <a href={`https://${portalDomain}`} target="_blank" rel="noopener noreferrer" className="font-bold">{portalDomain}</a>
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <div className="aspan-footer-social"><SocialLinks profile={profile} locale={locale} withTitle={false} /></div>
          <a href="#" className="aspan-top" aria-label={T.top[locale]}>↑</a>
        </div>
      </div>
      <div className="aspan-footer-strip" aria-hidden />
    </footer>
  );
}
