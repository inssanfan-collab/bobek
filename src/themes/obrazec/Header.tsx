import Link from 'next/link';
import { pick } from '@/lib/i18n';
import type { ThemeHeaderProps } from '../types';

/**
 * Шапка «Образца»: тёмная полоса с кнопками сверху, логотип и название
 * по центру, меню строкой под ними. Кнопки (`tools`) и меню (`nav`)
 * приходят готовыми — тема только ставит их на место.
 */
export function ObrazecHeader({ profile, locale, homeHref, tools, nav }: ThemeHeaderProps) {
  const name = pick(locale, profile?.shortNameKk ?? profile?.nameKk, profile?.shortNameRu ?? profile?.nameRu);

  return (
    <header className="site-header obrazec-header sticky top-0 z-40">
      <div className="obrazec-topbar">
        <div className="container-page flex items-center justify-between gap-3 py-1.5 text-sm">
          <span className="truncate opacity-80">{profile?.phone ?? ''}</span>
          <div className="flex shrink-0 items-center gap-1">{tools}</div>
        </div>
      </div>

      <div className="container-page flex flex-col items-center gap-2 py-4 text-center">
        <Link href={homeHref} className="flex flex-col items-center gap-2">
          {profile?.logoMediaId ? (
            // eslint-disable-next-line @next/next/no-img-element -- файл отдаёт /api/media
            <img src={`/api/media/${profile.logoMediaId}`} alt="" className="h-14 w-14 rounded-full object-contain" />
          ) : null}
          <span className="font-display text-2xl font-extrabold leading-tight">{name || 'Балабақша'}</span>
        </Link>
      </div>

      {nav}
    </header>
  );
}
