import { SectionLinkList, SiteLink } from '@/components/site/blocks';
import { SocialLinks } from '@/components/site/SocialLinks';
import { pick } from '@/lib/i18n';
import type { ThemeFooterProps } from '../types';

const T = {
  search: { kk: 'Сайт бойынша іздеу', ru: 'Поиск по сайту' },
  find: { kk: 'Іздеу', ru: 'Найти' },
  sections: { kk: 'Сайт бөлімдері', ru: 'Разделы сайта' },
  contacts: { kk: 'Байланыс', ru: 'Контакты' },
  queue: { kk: 'Балабақшаға кезек (Darabala.kz)', ru: 'Очередь в детский сад (Darabala.kz)' },
  newTab: { kk: 'жаңа терезеде ашылады', ru: 'откроется в новой вкладке' },
  news: { kk: 'Жаңалықтар', ru: 'Новости' },
  year: { kk: 'жыл', ru: 'год' },
  poweredBy: { kk: 'Сайт жасалған', ru: 'Сайт работает на платформе' },
  top: { kk: 'Жоғары', ru: 'Наверх' },
} as const;

/**
 * Подвал «Акорда» — как у образца: тёмная плита #333 со знаком в правом
 * верхнем углу, строка поиска с синей кнопкой, карта сайта тремя колонками
 * (светлые заголовки, серые ссылки, при наведении золотые), линия и внизу
 * адрес с годом и значки соцсетей.
 */
export function AkordaFooter({ profile, sections, locale, portalDomain }: ThemeFooterProps) {
  const address = pick(locale, profile?.addressKk, profile?.addressRu);
  const name = pick(locale, profile?.nameKk, profile?.nameRu);
  const half = Math.ceil(sections.length / 2);
  const left = sections.slice(0, half);
  const right = sections.slice(half);

  return (
    <footer className="akorda-footer mt-16">
      {/* Солнце и беркут с флага — государственный символ: у частного сада плита без знака. */}
      <div className={`akorda-footer-plate ${profile?.isPrivate ? '' : 'akorda-footer-state'}`}>
        <div className="container-page py-12">
          <form action="/search" method="get" role="search" className="akorda-search">
            <input type="hidden" name="lang" value={locale} />
            <label htmlFor="akorda-q" className="sr-only">{T.search[locale]}</label>
            <input id="akorda-q" name="q" type="search" minLength={2} maxLength={200} placeholder={T.search[locale]} />
            <button type="submit">{T.find[locale]}</button>
          </form>

          <div className="akorda-map">
            <div>
              <p className="akorda-map-title">{T.sections[locale]}</p>
              <SectionLinkList sections={left} locale={locale} className="akorda-map-list" limit={12} />
            </div>
            <div>
              <p className="akorda-map-title">&nbsp;</p>
              <SectionLinkList sections={right} locale={locale} className="akorda-map-list" limit={12} />
            </div>
            <div>
              <p className="akorda-map-title">{T.contacts[locale]}</p>
              <ul className="akorda-map-list">
                {profile?.phone ? <li><a href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`}>{profile.phone}</a></li> : null}
                {profile?.phoneExtra ? <li><span>{profile.phoneExtra}</span></li> : null}
                {profile?.email ? <li><a href={`mailto:${profile.email}`}>{profile.email}</a></li> : null}
                {profile?.workHours ? <li><span>{profile.workHours}</span></li> : null}
                <li>
                  <a href="https://darabala.kz" target="_blank" rel="noopener noreferrer">
                    {T.queue[locale]}<span className="sr-only"> ({T.newTab[locale]})</span>
                  </a>
                </li>
              </ul>
              <p className="akorda-map-title akorda-map-title-link"><SiteLink href="/news" locale={locale}>{T.news[locale]}</SiteLink></p>
            </div>
          </div>

          <hr className="akorda-footer-hr" />

          <div className="akorda-footer-bottom">
            <p>
              {address ? `${address} | ` : ''}{name ? `${name} | ` : ''}{new Date().getFullYear()} {T.year[locale]}
              {' · '}{T.poweredBy[locale]}{' '}
              <a href={`https://${portalDomain}`} target="_blank" rel="noopener noreferrer">{portalDomain}</a>
            </p>
            <div className="akorda-footer-social">
              <SocialLinks profile={profile} locale={locale} withTitle={false} />
            </div>
          </div>
          <p className="akorda-footer-top"><a href="#">↑ {T.top[locale]}</a></p>
        </div>
      </div>
    </footer>
  );
}
