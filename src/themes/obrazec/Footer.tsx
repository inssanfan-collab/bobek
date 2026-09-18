import { pick } from '@/lib/i18n';
import type { ThemeFooterProps } from '../types';

const T = {
  queue: { kk: 'Балабақшаға кезек (Darabala.kz)', ru: 'Очередь в детский сад (Darabala.kz)' },
  poweredBy: { kk: 'Сайт жасалған', ru: 'Сайт работает на платформе' },
} as const;

/** Подвал «Образца»: тёмный, в одну колонку по центру. */
export function ObrazecFooter({ profile, locale, portalDomain }: ThemeFooterProps) {
  const address = pick(locale, profile?.addressKk, profile?.addressRu);

  return (
    <footer className="obrazec-footer mt-16">
      <div className="container-page space-y-2 py-10 text-center text-sm">
        <p className="font-display text-lg font-extrabold">{pick(locale, profile?.nameKk, profile?.nameRu)}</p>
        {address ? <p>{address}</p> : null}
        {profile?.phone ? (
          <p>
            <a href={`tel:${profile.phone.replace(/\s/g, '')}`} className="font-semibold">{profile.phone}</a>
          </p>
        ) : null}
        <p>
          <a href="https://darabala.kz" target="_blank" rel="noopener noreferrer" className="underline">
            {T.queue[locale]}
          </a>
        </p>
        <p className="pt-4 opacity-70">
          {T.poweredBy[locale]}{' '}
          <a href={`https://${portalDomain}`} target="_blank" rel="noopener noreferrer" className="font-semibold">
            {portalDomain}
          </a>
        </p>
      </div>
    </footer>
  );
}
