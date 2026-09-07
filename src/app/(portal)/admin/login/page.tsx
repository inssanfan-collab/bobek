import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { csrfToken } from '@/server/auth/csrf';
import { getCurrentUser } from '@/server/auth/session';
import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Вход в админку', robots: { index: false } };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect('/admin');

  const [csrf, params] = await Promise.all([csrfToken(), searchParams]);

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="card w-full max-w-md p-8">
        <h1 className="font-display text-2xl font-extrabold">Вход в админку</h1>
        <p className="mt-1.5 text-sm text-muted">
          Доступы выдаёт администратор портала. Забыли пароль — позвоните ему, он сбросит.
        </p>
        <div className="mt-6">
          <LoginForm csrf={csrf} next={params.next} />
        </div>
      </div>
    </div>
  );
}
