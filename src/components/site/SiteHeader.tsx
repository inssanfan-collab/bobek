import Link from 'next/link';
import { A11yToggle } from '@/components/A11yToggle';
import { LocaleSwitch } from './LocaleSwitch';
import { SiteNav } from './SiteNav';
import { pick, type Locale } from '@/lib/i18n';
import { withLocale } from '@/server/tenant/context';
import type { Section, TenantProfile } from '@prisma/client';

const T = {
  menu: { kk: 'Мәзір', ru: 'Меню' },
  home: { kk: 'Басты бет', ru: 'Главная' },
  search: { kk: 'Іздеу', ru: 'Поиск' },
} as const;

export function SiteHeader({
  profile,
  sections,
  locale,
  pathname,
  compact = false,
}: {
  profile: TenantProfile | null;
  sections: Section[];
  locale: Locale;
  pathname: string;
  compact?: boolean;
}) {
  const name = pick(locale, profile?.shortNameKk ?? profile?.nameKk, profile?.shortNameRu ?? profile?.nameRu);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="container-page flex items-center gap-4 py-3">
        <Link href={withLocale('/', locale)} className="flex min-w-0 items-center gap-3">
          {profile?.logoMediaId ? (
            // Логотип сада вместо заглушки. object-contain, а не cover:
            // у садов гербы и эмблемы непредсказуемых пропорций, обрезать их нельзя.
            // eslint-disable-next-line @next/next/no-img-element -- файл отдаёт /api/media, оптимизатор Next с ним не работает
            <img
              src={`/api/media/${profile.logoMediaId}`}
              alt=""
              className="h-11 w-11 shrink-0 rounded-2xl object-contain"
            />
          ) : (
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand text-white">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M4 20V9.5L12 4l8 5.5V20" />
                <path d="M9.5 20v-5.5h5V20" />
                <path d="M4 20h16" />
              </svg>
            </span>
          )}
          <span className="min-w-0">
            <span className={`block truncate font-display font-extrabold leading-tight ${compact ? 'text-base' : 'text-lg'}`}>
              {name || 'Балабақша'}
            </span>
            {profile?.district ? (
              <span className="block truncate text-xs text-muted">{profile.district}</span>
            ) : null}
          </span>
        </Link>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <A11yToggle />
          <LocaleSwitch locale={locale} pathname={pathname} />
        </div>
      </div>

      <SiteNav
        locale={locale}
        links={[
          { href: withLocale('/', locale), label: T.home[locale] },
          ...sections.map((section) => ({
            href: withLocale(`/${section.slug}`, locale),
            label: pick(locale, section.titleKk, section.titleRu),
          })),
          { href: withLocale('/search', locale), label: T.search[locale] },
        ]}
      />
    </header>
  );
}
