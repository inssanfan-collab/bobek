import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { csrfToken } from '@/server/auth/csrf';
import { getCurrentUser } from '@/server/auth/session';
import { siteContext } from '@/server/tenant/context';
import { LoginForm } from '@/app/(portal)/admin/login/LoginForm';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Вход', robots: { index: false } };

export default async function TenantLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ host: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { host } = await params;
  const { profile } = await siteContext(host);

  const user = await getCurrentUser();
  if (user) redirect('/admin');

  const [csrf, search] = await Promise.all([csrfToken(), searchParams]);

  return (
    <div className="container-page flex min-h-screen items-center justify-center py-12">
      <div className="card w-full max-w-md p-8">
        <h1 className="font-display text-2xl font-extrabold">Вход в админку</h1>
        <p className="mt-1 text-sm text-muted">{profile?.nameRu ?? 'Детский сад'}</p>
        <p className="mt-4 text-sm text-muted">
          Логин и пароль выдаёт администратор портала. Забыли пароль — позвоните ему.
        </p>
        <div className="mt-6">
          <LoginForm csrf={csrf} next={search.next} />
        </div>
      </div>
    </div>
  );
}
