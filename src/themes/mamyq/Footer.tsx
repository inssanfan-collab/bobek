import { SectionLinkList } from '@/components/site/blocks';
import { SocialLinks } from '@/components/site/SocialLinks';
import { pick } from '@/lib/i18n';
import type { ThemeFooterProps } from '../types';

const T = {
  about: { kk: 'Біз туралы', ru: 'О нас' },
  contacts: { kk: 'Байланыс', ru: 'Контакты' },
  address: { kk: 'Мекенжайымыз', ru: 'Наш адрес' },
  sections: { kk: 'Бөлімдер', ru: 'Разделы' },
  queue: { kk: 'Балабақшаға кезек (Darabala.kz)', ru: 'Очередь в детский сад (Darabala.kz)' },
  poweredBy: { kk: 'Сайт жасалған', ru: 'Сайт работает на платформе' },
  top: { kk: 'Жоғары', ru: 'Наверх' },
} as const;

/**
 * Подвал «Мамық» — светлый, как в образце №9: сверху полоса пастельных
 * рисунков, три колонки по центру с розовыми заголовками, разделы
 * строкой и копирайт.
 */
export function MamyqFooter({ profile, sections, locale, portalDomain }: ThemeFooterProps) {
  const name = pick(locale, profile?.nameKk, profile?.nameRu) || 'Балабақша';
  const about = pick(locale, profile?.aboutKk, profile?.aboutRu);
  const address = pick(locale, profile?.addressKk, profile?.addressRu);

  return (
    <footer className="mamyq-footer">
      <div className="mamyq-footer-strip" aria-hidden />
      <div className="container-page grid gap-10 py-12 text-center md:grid-cols-3">
        <div>
          <p className="mamyq-footer-title">{T.about[locale]}</p>
          <p className="mamyq-footer-about text-sm">{about || name}</p>
        </div>
        <div>
          <p className="mamyq-footer-title">{T.contacts[locale]}</p>
          <ul className="space-y-2 text-sm">
            {profile?.phone ? <li><a href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`}>{profile.phone}</a></li> : null}
            {profile?.phoneExtra ? <li>{profile.phoneExtra}</li> : null}
            {profile?.email ? <li><a href={`mailto:${profile.email}`} className="break-all">{profile.email}</a></li> : null}
          </ul>
        </div>
        <div>
          <p className="mamyq-footer-title">{T.address[locale]}</p>
          {address ? <p className="text-sm">{address}</p> : null}
          {profile?.workHours ? <p className="mt-1 text-sm">{profile.workHours}</p> : null}
          <div className="mamyq-footer-social mt-4"><SocialLinks profile={profile} locale={locale} withTitle={false} /></div>
        </div>
      </div>
      <div className="container-page pb-8 text-center text-sm">
        <SectionLinkList sections={sections} locale={locale} limit={12} className="mamyq-footer-links" />
        <p className="mt-5">
          © {new Date().getFullYear()} {name} · {T.poweredBy[locale]}{' '}
          <a href={`https://${portalDomain}`} target="_blank" rel="noopener noreferrer" className="mamyq-footer-portal">{portalDomain}</a>
          {' · '}
          <a href="https://darabala.kz" target="_blank" rel="noopener noreferrer">{T.queue[locale]}</a>
          {' · '}
          <a href="#" className="font-bold">↑ {T.top[locale]}</a>
        </p>
      </div>
    </footer>
  );
}
