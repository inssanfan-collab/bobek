import { SectionLinkList } from '@/components/site/blocks';
import { SocialLinks } from '@/components/site/SocialLinks';
import { ThemeImage } from '@/components/site/theme-kit';
import { pick } from '@/lib/i18n';
import type { ThemeFooterProps } from '../types';
import { Icon, Mark } from './Doodles';

const T = {
  email: { kk: 'Электрондық пошта', ru: 'Эл. почта' },
  phone: { kk: 'Телефон', ru: 'Телефон' },
  info: { kk: 'Ақпарат', ru: 'Информация' },
  nav: { kk: 'Навигация', ru: 'Навигация' },
  queueTitle: { kk: 'Балабақшаға кезек', ru: 'Очередь в детский сад' },
  queueText: { kk: 'Кезекке Darabala.kz порталы арқылы тұрады.', ru: 'В очередь встают через портал Darabala.kz.' },
  queue: { kk: 'Darabala.kz', ru: 'Darabala.kz' },
  poweredBy: { kk: 'Сайт жасалған', ru: 'Сайт работает на платформе' },
  top: { kk: 'Жоғары', ru: 'Наверх' },
} as const;

/**
 * Подвал «Қуаныш» — фиолетовый поверх фото, как в образце №4: знак,
 * почта и телефон в жёлтых кружках, «Ақпарат» с текстом о саде,
 * навигация двумя колонками, жёлтая плашка; внизу — красная полоса.
 */
export function KuanyshFooter({ profile, sections, locale, portalDomain }: ThemeFooterProps) {
  const name = pick(locale, profile?.nameKk, profile?.nameRu) || 'Балабақша';
  const about = pick(locale, profile?.aboutKk, profile?.aboutRu);
  const address = pick(locale, profile?.addressKk, profile?.addressRu);

  return (
    <footer className="kuanysh-footer">
      <ThemeImage theme="kuanysh" name="footer" className="kuanysh-footer-photo decor" sizes="100vw" />
      <div className="relative">
        <div className="container-page kuanysh-footer-top">
          <p className="flex items-center gap-3">
            <span className="kuanysh-footer-mark" aria-hidden><Mark /></span>
            <span className="kuanysh-footer-name">{name}</span>
          </p>
          {profile?.email ? (
            <p className="flex items-center gap-3">
              <span className="kuanysh-footer-dot"><Icon name="mail" className="h-5 w-5" /></span>
              <span className="text-sm"><b className="block">{T.email[locale]}</b><a href={`mailto:${profile.email}`}>{profile.email}</a></span>
            </p>
          ) : null}
          {profile?.phone ? (
            <p className="flex items-center gap-3">
              <span className="kuanysh-footer-dot"><Icon name="phone" className="h-5 w-5" /></span>
              <span className="text-sm"><b className="block">{T.phone[locale]}</b><a href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`}>{profile.phone}</a></span>
            </p>
          ) : null}
        </div>
        <div className="container-page grid gap-10 py-10 md:grid-cols-[1.1fr_1fr_0.9fr]">
          <div>
            <p className="kuanysh-footer-title">{T.info[locale]}</p>
            {about ? <p className="kuanysh-footer-about text-sm">{about}</p> : null}
            {address ? <p className="mt-3 text-sm">{address}</p> : null}
            {profile?.workHours ? <p className="mt-1 text-sm">{profile.workHours}</p> : null}
          </div>
          <div>
            <p className="kuanysh-footer-title">{T.nav[locale]}</p>
            <SectionLinkList sections={sections} locale={locale} limit={12} className="kuanysh-footer-links text-sm" />
          </div>
          <div className="kuanysh-footer-box">
            <p className="kuanysh-footer-box-title">{T.queueTitle[locale]}</p>
            <p className="mt-2 text-sm">{T.queueText[locale]}</p>
            <a href="https://darabala.kz" target="_blank" rel="noopener noreferrer" className="kuanysh-footer-box-btn">{T.queue[locale]}</a>
          </div>
        </div>
        <div className="kuanysh-footer-bottom">
          <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
            <p>
              © {new Date().getFullYear()} {name} · {T.poweredBy[locale]}{' '}
              <a href={`https://${portalDomain}`} target="_blank" rel="noopener noreferrer" className="kuanysh-footer-portal">{portalDomain}</a>
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="kuanysh-footer-social"><SocialLinks profile={profile} locale={locale} withTitle={false} /></div>
              <a href="#" className="kuanysh-top" aria-label={T.top[locale]}>↑</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
