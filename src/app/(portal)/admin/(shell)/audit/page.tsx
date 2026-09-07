import { prisma } from '@/server/db';
import { requireSuperadmin } from '@/server/auth/guards';
import { PageHeader } from '@/components/admin/AdminShell';
import { formatDateTime } from '@/lib/labels';

export const dynamic = 'force-dynamic';

const ACTION_LABEL: Record<string, string> = {
  'auth.login': 'Вход',
  'auth.login_failed': 'Неудачная попытка входа',
  'auth.logout': 'Выход',
  'auth.password_changed': 'Смена пароля',
  'tenant.create': 'Создан сад',
  'tenant.update': 'Изменён сад',
  'tenant.status_change': 'Изменён статус сада',
  'tenant.impersonate': 'Вход под садом',
  'domain.add': 'Добавлен домен',
  'domain.verify': 'Проверка DNS',
  'domain.delete': 'Удалён домен',
  'domain.set_primary': 'Смена основного домена',
  'user.create': 'Создан пользователь',
  'user.reset_password': 'Сброшен пароль',
  'user.deactivate': 'Пользователь отключён',
  'user.activate': 'Пользователь включён',
  'subscription.extend': 'Продлена подписка',
  'payment.record': 'Отмечена оплата',
  'content.create': 'Создан материал',
  'content.update': 'Изменён материал',
  'content.delete': 'Удалён материал',
};

const SENSITIVE = new Set(['user.reset_password', 'tenant.impersonate', 'auth.login_failed', 'tenant.status_change']);

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireSuperadmin();
  const page = Math.max(1, Number.parseInt((await searchParams).page ?? '1', 10) || 1);
  const pageSize = 100;

  const [entries, total] = await Promise.all([
    prisma.auditLog.findMany({
      include: { tenant: { include: { profile: true } } },
      orderBy: { createdAt: 'desc' },
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
    prisma.auditLog.count(),
  ]);

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <PageHeader
        title="Журнал действий"
        description="Сбросы паролей, входы под садом и изменения статусов фиксируются здесь."
      />

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Когда</th>
              <th className="px-4 py-3 font-semibold">Кто</th>
              <th className="px-4 py-3 font-semibold">Действие</th>
              <th className="px-4 py-3 font-semibold">Сад</th>
              <th className="px-4 py-3 font-semibold">Детали</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {entries.map((entry) => (
              <tr key={entry.id} className={SENSITIVE.has(entry.action) ? 'bg-amber-50/60' : ''}>
                <td className="whitespace-nowrap px-4 py-2.5 text-muted">{formatDateTime(entry.createdAt)}</td>
                <td className="px-4 py-2.5 font-mono">{entry.userLogin ?? '—'}</td>
                <td className="px-4 py-2.5 font-semibold">{ACTION_LABEL[entry.action] ?? entry.action}</td>
                <td className="px-4 py-2.5 text-muted">{entry.tenant?.profile?.nameRu ?? entry.tenant?.slug ?? '—'}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-muted">
                  {Object.keys(entry.meta as object).length ? JSON.stringify(entry.meta) : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 ? (
        <div className="mt-4 flex items-center gap-2 text-sm">
          {page > 1 ? <a href={`?page=${page - 1}`} className="btn-secondary">← Назад</a> : null}
          <span className="text-muted">Страница {page} из {pages}</span>
          {page < pages ? <a href={`?page=${page + 1}`} className="btn-secondary">Вперёд →</a> : null}
        </div>
      ) : null}
    </>
  );
}
