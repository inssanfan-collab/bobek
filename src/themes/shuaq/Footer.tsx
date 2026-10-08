import { SectionLinkList } from '@/components/site/blocks';
import { SocialLinks } from '@/components/site/SocialLinks';
import { ThemeImage } from '@/components/site/theme-kit';
import { pick } from '@/lib/i18n';
import type { ThemeFooterProps } from '../types';

const T = {
  sections: { kk: 'Сайт бөлімдері', ru: 'Разделы сайта' },
  contacts: { kk: 'Байланыс', ru: 'Контакты' },
  call: { kk: 'Қоңырау шалу', ru: 'Позвонить' },
  social: { kk: 'Әлеуметтік желі', ru: 'Соцсети' },
  poweredBy: { kk: 'Сайт жасалған', ru: 'Сайт работает на платформе' },
  top: { kk: 'Жоғары', ru: 'Наверх' },
} as const;

/**
 * Подвал «Шуақ»: фиолетовый с прошитым краем, название крупно, телефон
 * в зелёном круге, разделы двумя колонками, внизу — розовая полоса.
 */
export function ShuaqFooter({ profile, sections, locale, portalDomain }: ThemeFooterProps) {
  const name = pick(locale, profile?.nameKk, profile?.nameRu) || 'Балабақша';
  const address = pick(locale, profile?.addressKk, profile?.addressRu);

  return (
    <footer className="shuaq-footer mt-16">
      <div className="shuaq-footer-body">
        <ThemeImage theme="shuaq" name="cartoon" className="shuaq-footer-kids decor" sizes="13rem" />
        <div className="container-page grid gap-10 py-12 md:grid-cols-[1.2fr_1.3fr_1fr]">
          <div>
            <p className="shuaq-footer-name">{name}</p>
            {address ? <p className="mt-3 text-sm">{address}</p> : null}
            {profile?.workHours ? <p className="mt-1 text-sm">{profile.workHours}</p> : null}
            {profile?.phone ? (
              <p className="mt-5 flex items-center gap-3">
                <span className="shuaq-footer-phone" aria-hidden>☏</span>
                <span>
                  <span className="block text-xs opacity-80">{T.call[locale]}</span>
                  <a href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`} className="font-bold">{profile.phone}</a>
                </span>
              </p>
            ) : null}
          </div>
          <div>
            <p className="shuaq-footer-title">{T.sections[locale]}</p>
            <SectionLinkList sections={sections} locale={locale} limit={12} className="shuaq-footer-links text-sm" />
          </div>
          <div>
            <p className="shuaq-footer-title">{T.contacts[locale]}</p>
            <ul className="space-y-1.5 break-words text-sm">
              {profile?.email ? <li><a href={`mailto:${profile.email}`}>{profile.email}</a></li> : null}
              {profile?.phoneExtra ? <li>{profile.phoneExtra}</li> : null}
            </ul>
            <div className="shuaq-footer-social mt-4">
              <SocialLinks profile={profile} locale={locale} withTitle={false} />
            </div>
          </div>
        </div>
      </div>
      <div className="shuaq-footer-bottom">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
          <p>
            © {new Date().getFullYear()} {name} · {T.poweredBy[locale]}{' '}
            <a href={`https://${portalDomain}`} target="_blank" rel="noopener noreferrer" className="font-bold">{portalDomain}</a>
          </p>
          <a href="#" className="font-bold">↑ {T.top[locale]}</a>
        </div>
      </div>
    </footer>
  );
}
