import { SectionLinkList } from '@/components/site/blocks';
import { SocialLinks } from '@/components/site/SocialLinks';
import { EnrollLink, ThemeImage } from '@/components/site/theme-kit';
import { pick } from '@/lib/i18n';
import type { ThemeFooterProps } from '../types';
import { Kids, Mail, Phone } from './Doodles';

const T = {
  ask: { kk: 'Балабақша жұмысы туралы сұрақтарыңыз болса, бізге хабарласыңыз.', ru: 'Если у вас есть вопросы о работе детского сада — напишите нам.' },
  address: { kk: 'Мекенжайымыз:', ru: 'Наш адрес:' },
  schedule: { kk: 'Жұмыс кестесі:', ru: 'Режим работы:' },
  sections: { kk: 'Бөлімдер:', ru: 'Разделы:' },
  poweredBy: { kk: 'Сайт жасалған', ru: 'Сайт работает на платформе' },
  top: { kk: 'Жоғары', ru: 'Наверх' },
} as const;

/**
 * Подвал «Жасыл» — красно-оранжевый поверх фото, как в образце №2:
 * знак и название, призыв написать с белой кнопкой; адрес с тремя
 * снимками, режим работы с почтой и телефоном, разделы двумя колонками.
 */
export function JasylFooter({ profile, sections, locale, portalDomain }: ThemeFooterProps) {
  const name = pick(locale, profile?.nameKk, profile?.nameRu) || 'Балабақша';
  const address = pick(locale, profile?.addressKk, profile?.addressRu);

  return (
    <footer className="jasyl-footer">
      <ThemeImage theme="jasyl" name="table" className="jasyl-footer-photo decor" sizes="100vw" />
      <div className="relative">
        <div className="container-page jasyl-footer-top">
          <p className="flex items-center gap-3">
            <span className="jasyl-footer-mark" aria-hidden><Kids /></span>
            <span className="jasyl-footer-name">{name}</span>
          </p>
          <p className="jasyl-footer-ask">{T.ask[locale]}</p>
          <EnrollLink menu={sections} locale={locale} className="jasyl-footer-btn" />
        </div>
        <div className="container-page grid gap-10 py-10 md:grid-cols-3">
          <div>
            <p className="jasyl-footer-title">{T.address[locale]}</p>
            {address ? <p className="text-sm">{address}</p> : null}
            <div className="jasyl-footer-thumbs" aria-hidden>
              <ThemeImage theme="jasyl" name="yard" sizes="8rem" />
              <ThemeImage theme="jasyl" name="football" sizes="8rem" />
              <ThemeImage theme="jasyl" name="desk" sizes="8rem" />
            </div>
          </div>
          <div>
            <p className="jasyl-footer-title">{T.schedule[locale]}</p>
            {profile?.workHours ? <p className="text-sm">{profile.workHours}</p> : null}
            <ul className="mt-5 space-y-3 break-words text-sm">
              {profile?.email ? (
                <li className="flex items-center gap-3"><span className="jasyl-footer-dot"><Mail /></span><a href={`mailto:${profile.email}`}>{profile.email}</a></li>
              ) : null}
              {profile?.phone ? (
                <li className="flex items-center gap-3"><span className="jasyl-footer-dot"><Phone /></span><a href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`} className="font-bold">{profile.phone}</a></li>
              ) : null}
            </ul>
          </div>
          <div>
            <p className="jasyl-footer-title">{T.sections[locale]}</p>
            <SectionLinkList sections={sections} locale={locale} limit={12} className="jasyl-footer-links text-sm" />
          </div>
        </div>
        <div className="jasyl-footer-bottom">
          <div className="container-page flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
            <p>
              © {new Date().getFullYear()} {name} · {T.poweredBy[locale]}{' '}
              <a href={`https://${portalDomain}`} target="_blank" rel="noopener noreferrer" className="font-bold">{portalDomain}</a>
            </p>
            <div className="flex items-center gap-4">
              <div className="jasyl-footer-social"><SocialLinks profile={profile} locale={locale} withTitle={false} /></div>
              <a href="#" className="font-bold">↑ {T.top[locale]}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
