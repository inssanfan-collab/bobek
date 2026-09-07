import { prisma } from '@/server/db';
import { requireSuperadmin } from '@/server/auth/guards';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { Alert } from '@/components/ui/Alert';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { formatDateTime, ROLE_LABEL } from '@/lib/labels';
import { NewUserForm } from './NewUserForm';
import { resetUserPassword, toggleUserActive } from '../tenants/actions';

export const dynamic = 'force-dynamic';

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ tenantId?: string; reset?: string; password?: string }>;
}) {
  await requireSuperadmin();
  const [params, csrf, users, tenants] = await Promise.all([
    searchParams,
    csrfToken(),
    prisma.user.findMany({
      include: { tenant: { include: { profile: true } } },
      orderBy: [{ role: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.tenant.findMany({
      where: { status: { not: 'ARCHIVED' } },
      include: { profile: true },
      orderBy: { slug: 'asc' },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Пользователи"
        description="Все доступы создаёт и восстанавливает администратор портала."
      />

      {params.reset && params.password ? (
        <div className="mb-6">
          <Alert tone="success" title={`Пароль для «${params.reset}» сброшен`}>
            <p>Новый пароль: <strong className="font-mono text-base">{params.password}</strong></p>
            <p className="mt-1">
              Продиктуйте его сотруднику. При входе система попросит сменить пароль.
              Все прежние сессии этого пользователя закрыты.
            </p>
          </Alert>
        </div>
      ) : null}

      <div className="mb-6">
        <NewUserForm
          csrf={csrf}
          defaultTenantId={params.tenantId}
          tenants={tenants.map((t) => ({ id: t.id, label: t.profile?.nameRu ?? t.slug }))}
        />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">ФИО</th>
              <th className="px-4 py-3 font-semibold">Логин</th>
              <th className="px-4 py-3 font-semibold">Сад</th>
              <th className="px-4 py-3 font-semibold">Роль</th>
              <th className="px-4 py-3 font-semibold">Последний вход</th>
              <th className="px-4 py-3 font-semibold">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((user) => (
              <tr key={user.id} className={user.isActive ? '' : 'opacity-60'}>
                <td className="px-4 py-3 font-semibold">{user.fullName}</td>
                <td className="px-4 py-3 font-mono">{user.login}</td>
                <td className="px-4 py-3 text-muted">{user.tenant?.profile?.nameRu ?? user.tenant?.slug ?? '—'}</td>
                <td className="px-4 py-3 text-muted">{ROLE_LABEL[user.role]}</td>
                <td className="px-4 py-3 text-muted">{user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'ни разу'}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <form action={resetUserPassword}>
                      <input type="hidden" name={CSRF_FIELD} value={csrf} />
                      <input type="hidden" name="userId" value={user.id} />
                      <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">Сбросить пароль</button>
                    </form>
                    {user.role !== 'SUPERADMIN' ? (
                      <form action={toggleUserActive}>
                        <input type="hidden" name={CSRF_FIELD} value={csrf} />
                        <input type="hidden" name="userId" value={user.id} />
                        <button type="submit" className="btn-ghost px-3 py-1.5 text-xs">
                          {user.isActive ? 'Отключить' : 'Включить'}
                        </button>
                      </form>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
