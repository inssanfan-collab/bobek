import { SectionLinkList } from '@/components/site/blocks';
import { SocialLinks } from '@/components/site/SocialLinks';
import { pick } from '@/lib/i18n';
import type { ThemeFooterProps } from '../types';

const LETTERS = ['#FCA5A5', '#FDBA74', '#86EFAC', '#93C5FD', '#D8B4FE', '#F9A8D4'];

const T = {
  sections: { kk: 'Бөлімдер', ru: 'Разделы' },
  contacts: { kk: 'Байланыс', ru: 'Контакты' },
  queue: { kk: 'Балабақшаға кезек (Darabala.kz)', ru: 'Очередь в детский сад (Darabala.kz)' },
  poweredBy: { kk: 'Сайт жасалған', ru: 'Сайт работает на платформе' },
  top: { kk: 'Жоғары', ru: 'Наверх' },
} as const;

/**
 * Подвал «Қосақ» — синий в облаках, как в образце №5: название
 * разноцветными буквами и текст о саде, разделы двумя колонками,
 * контакты и соцсети; внизу — малиновая полоса.
 */
export function KosaqFooter({ profile, sections, locale, portalDomain }: ThemeFooterProps) {
  const name = pick(locale, profile?.nameKk, profile?.nameRu) || 'Балабақша';
  const about = pick(locale, profile?.aboutKk, profile?.aboutRu);
  const address = pick(locale, profile?.addressKk, profile?.addressRu);
  let colorIndex = 0;

  return (
    <footer className="kosaq-footer">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.2fr_1.3fr_1fr]">
        <div>
          <p className="kosaq-footer-name">
            <span className="sr-only">{name}</span>
            <span aria-hidden>
              {[...name].map((char, index) => {
                if (char.trim() === '') return <span key={index}> </span>;
                const color = LETTERS[colorIndex % LETTERS.length];
                colorIndex += 1;
                return <span key={index} style={{ color }}>{char}</span>;
              })}
            </span>
          </p>
          {about ? <p className="kosaq-footer-about mt-4 text-sm">{about}</p> : null}
        </div>
        <div>
          <p className="kosaq-footer-title">{T.sections[locale]}</p>
          <SectionLinkList sections={sections} locale={locale} limit={12} className="kosaq-footer-links text-sm" />
        </div>
        <div>
          <p className="kosaq-footer-title">{T.contacts[locale]}</p>
          <ul className="space-y-2 break-words text-sm">
            {address ? <li>{address}</li> : null}
            {profile?.workHours ? <li>{profile.workHours}</li> : null}
            {profile?.phone ? <li><a href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`} className="font-bold">{profile.phone}</a></li> : null}
            {profile?.email ? <li><a href={`mailto:${profile.email}`}>{profile.email}</a></li> : null}
            <li><a href="https://darabala.kz" target="_blank" rel="noopener noreferrer">{T.queue[locale]}</a></li>
          </ul>
          <div className="kosaq-footer-social mt-4"><SocialLinks profile={profile} locale={locale} withTitle={false} /></div>
        </div>
      </div>
      <div className="kosaq-footer-bottom">
        <div className="container-page flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-3 text-center text-sm">
          <p>
            © {new Date().getFullYear()} {name} · {T.poweredBy[locale]}{' '}
            <a href={`https://${portalDomain}`} target="_blank" rel="noopener noreferrer" className="font-bold">{portalDomain}</a>
          </p>
          <a href="#" className="kosaq-top" aria-label={T.top[locale]}>↑</a>
        </div>
      </div>
    </footer>
  );
}
