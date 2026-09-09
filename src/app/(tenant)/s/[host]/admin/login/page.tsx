import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { csrfToken } from '@/server/auth/csrf';
import { getCurrentUser } from '@/server/auth/session';
import { siteContext, localeFrom } from '@/server/tenant/context';
import { LoginForm } from '@/app/(portal)/admin/login/LoginForm';
import { pick, LOCALES, LOCALE_LABEL } from '@/lib/i18n';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Вход', robots: { index: false } };

const T = {
  title: { kk: 'Әкімші бөліміне кіру', ru: 'Вход в админку' },
  fallbackName: { kk: 'Балабақша', ru: 'Детский сад' },
  hint: {
    kk: 'Логин мен құпия сөзді портал әкімшісі береді. Ұмытсаңыз — оған қоңырау шалыңыз.',
    ru: 'Логин и пароль выдаёт администратор портала. Забыли пароль — позвоните ему.',
  },
} as const;

export default async function TenantLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ host: string }>;
  searchParams: Promise<{ next?: string; lang?: string }>;
}) {
  const { host } = await params;
  const { profile } = await siteContext(host);

  const user = await getCurrentUser();
  if (user) redirect('/admin');

  const [csrf, search] = await Promise.all([csrfToken(), searchParams]);
  // Язык админки хранится у пользователя, но до входа его ещё некому спросить,
  // поэтому здесь он берётся из адреса — как на публичной части сайта.
  const locale = localeFrom(search.lang);

  return (
    <div className="container-page flex min-h-screen items-center justify-center py-12">
      <div className="card w-full max-w-md p-8">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-display text-2xl font-extrabold">{T.title[locale]}</h1>
          <div className="flex overflow-hidden rounded-xl border border-line">
            {LOCALES.map((code) => (
              <Link
                key={code}
                href={{ query: { ...(search.next ? { next: search.next } : {}), lang: code } }}
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

        <p className="mt-1 text-sm text-muted">
          {pick(locale, profile?.nameKk, profile?.nameRu) || T.fallbackName[locale]}
        </p>
        <p className="mt-4 text-sm text-muted">{T.hint[locale]}</p>

        <div className="mt-6">
          <LoginForm csrf={csrf} next={search.next} locale={locale} />
        </div>
      </div>
    </div>
  );
}
