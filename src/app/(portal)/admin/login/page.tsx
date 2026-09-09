import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { csrfToken } from '@/server/auth/csrf';
import { getCurrentUser } from '@/server/auth/session';
import { LoginForm } from './LoginForm';
import { LOCALES, LOCALE_LABEL, localeFromParam } from '@/lib/i18n';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Вход в админку', robots: { index: false } };

const T = {
  title: { kk: 'Әкімші бөліміне кіру', ru: 'Вход в админку' },
  hint: {
    kk: 'Кіру деректерін портал әкімшісі береді. Ұмытсаңыз — оған қоңырау шалыңыз, ол қайта тағайындайды.',
    ru: 'Доступы выдаёт администратор портала. Забыли пароль — позвоните ему, он сбросит.',
  },
} as const;

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; lang?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect('/admin');

  const [csrf, params] = await Promise.all([csrfToken(), searchParams]);
  // До входа язык пользователя ещё неизвестен — берём из адреса.
  const locale = localeFromParam(params.lang);

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="card w-full max-w-md p-8">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-display text-2xl font-extrabold">{T.title[locale]}</h1>
          <div className="flex overflow-hidden rounded-xl border border-line">
            {LOCALES.map((code) => (
              <Link
                key={code}
                href={{ query: { ...(params.next ? { next: params.next } : {}), lang: code } }}
                aria-current={code === locale}
                className={
                  code === locale
                    ? 'bg-brand px-2.5 py-1.5 text-xs font-bold text-white'
                    : 'px-2.5 py-1.5 text-xs font-semibold text-muted transition hover:bg-brand-soft'
                }
              >
                {LOCALE_LABEL[code]}
              </Link>
            ))}
          </div>
        </div>

        <p className="mt-1.5 text-sm text-muted">{T.hint[locale]}</p>

        <div className="mt-6">
          <LoginForm csrf={csrf} next={params.next} locale={locale} />
        </div>
      </div>
    </div>
  );
}
