import Link from 'next/link';
import { pick, type Locale } from '@/lib/i18n';
import { withLocale } from '@/server/tenant/context';
import type { Section, TenantProfile } from '@prisma/client';

const T = {
  contacts: { kk: 'Байланыс', ru: 'Контакты' },
  sections: { kk: 'Бөлімдер', ru: 'Разделы' },
  poweredBy: { kk: 'Сайт жасалған', ru: 'Сайт работает на платформе' },
  queue: { kk: 'Балабақшаға кезек (egov.kz)', ru: 'Очередь в детский сад (egov.kz)' },
} as const;

export function SiteFooter({
  profile,
  sections,
  locale,
  portalDomain,
}: {
  profile: TenantProfile | null;
  sections: Section[];
  locale: Locale;
  portalDomain: string;
}) {
  const address = pick(locale, profile?.addressKk, profile?.addressRu);

  return (
    <footer className="mt-16 border-t border-line bg-card">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="font-display text-lg font-extrabold">
            {pick(locale, profile?.nameKk, profile?.nameRu)}
          </p>
          {address ? <p className="mt-2 text-sm text-muted">{address}</p> : null}
          {profile?.workHours ? <p className="mt-1 text-sm text-muted">{profile.workHours}</p> : null}
        </div>

        <div>
          <p className="mb-2 font-semibold">{T.contacts[locale]}</p>
          <ul className="space-y-1.5 text-sm text-muted">
            {profile?.phone ? (
              <li><a href={`tel:${profile.phone.replace(/\s/g, '')}`} className="font-semibold text-brand">{profile.phone}</a></li>
            ) : null}
            {profile?.phoneExtra ? <li>{profile.phoneExtra}</li> : null}
            {profile?.email ? <li><a href={`mailto:${profile.email}`}>{profile.email}</a></li> : null}
            <li>
              <a href="https://egov.kz/cms/ru/articles/child/2Fdetskiii_sad_rk" target="_blank" rel="noopener noreferrer">
                {T.queue[locale]}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-2 font-semibold">{T.sections[locale]}</p>
          <ul className="space-y-1.5 text-sm text-muted">
            {sections.slice(0, 8).map((section) => (
              <li key={section.id}>
                <Link href={withLocale(`/${section.slug}`, locale)} className="hover:text-brand-ink">
                  {pick(locale, section.titleKk, section.titleRu)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line py-4 text-center text-sm text-muted">
        {T.poweredBy[locale]}{' '}
        <a href={`https://${portalDomain}`} className="font-semibold text-brand" target="_blank" rel="noopener noreferrer">
          {portalDomain}
        </a>
      </div>
    </footer>
  );
}
