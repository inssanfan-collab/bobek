import { prisma } from '@/server/db';
import { requireSuperadmin } from '@/server/auth/guards';
import { PageHeader } from '@/components/admin/AdminShell';
import { formatDateTime } from '@/lib/labels';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Әрекеттер журналы', ru: 'Журнал действий' },
  lead: {
    kk: 'Құпия сөзді тастау, балабақша атынан кіру және мәртебе өзгерістері осында тіркеледі.',
    ru: 'Сбросы паролей, входы под садом и изменения статусов фиксируются здесь.',
  },
  when: { kk: 'Қашан', ru: 'Когда' },
  who: { kk: 'Кім', ru: 'Кто' },
  action: { kk: 'Әрекет', ru: 'Действие' },
  garden: { kk: 'Балабақша', ru: 'Сад' },
  details: { kk: 'Егжей-тегжейі', ru: 'Детали' },
  prev: { kk: '← Артқа', ru: '← Назад' },
  next: { kk: 'Алға →', ru: 'Вперёд →' },
} as const;

const ACTION_LABEL: Record<string, { kk: string; ru: string }> = {
  'auth.login': { kk: 'Кіру', ru: 'Вход' },
  'auth.login_failed': { kk: 'Сәтсіз кіру әрекеті', ru: 'Неудачная попытка входа' },
  'auth.logout': { kk: 'Шығу', ru: 'Выход' },
  'auth.password_changed': { kk: 'Құпия сөзді ауыстыру', ru: 'Смена пароля' },
  'tenant.create': { kk: 'Балабақша құрылды', ru: 'Создан сад' },
  'tenant.update': { kk: 'Балабақша өзгертілді', ru: 'Изменён сад' },
  'tenant.status_change': { kk: 'Балабақша мәртебесі өзгертілді', ru: 'Изменён статус сада' },
  'tenant.impersonate': { kk: 'Балабақша атынан кіру', ru: 'Вход под садом' },
  'domain.add': { kk: 'Домен қосылды', ru: 'Добавлен домен' },
  'domain.verify': { kk: 'DNS тексеру', ru: 'Проверка DNS' },
  'domain.delete': { kk: 'Домен жойылды', ru: 'Удалён домен' },
  'domain.set_primary': { kk: 'Негізгі домен ауыстырылды', ru: 'Смена основного домена' },
  'user.create': { kk: 'Пайдаланушы құрылды', ru: 'Создан пользователь' },
  'user.reset_password': { kk: 'Құпия сөз тасталды', ru: 'Сброшен пароль' },
  'user.deactivate': { kk: 'Пайдаланушы өшірілді', ru: 'Пользователь отключён' },
  'user.activate': { kk: 'Пайдаланушы қосылды', ru: 'Пользователь включён' },
  'subscription.extend': { kk: 'Жазылым ұзартылды', ru: 'Продлена подписка' },
  'payment.record': { kk: 'Төлем белгіленді', ru: 'Отмечена оплата' },
  'content.create': { kk: 'Материал құрылды', ru: 'Создан материал' },
  'content.update': { kk: 'Материал өзгертілді', ru: 'Изменён материал' },
  'content.delete': { kk: 'Материал жойылды', ru: 'Удалён материал' },
};

const SENSITIVE = new Set(['user.reset_password', 'tenant.impersonate', 'auth.login_failed', 'tenant.status_change']);

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await requireSuperadmin();
  const locale = user.locale;
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
        title={T.title[locale]}
        description={T.lead[locale]}
      />

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">{T.when[locale]}</th>
              <th className="px-4 py-3 font-semibold">{T.who[locale]}</th>
              <th className="px-4 py-3 font-semibold">{T.action[locale]}</th>
              <th className="px-4 py-3 font-semibold">{T.garden[locale]}</th>
              <th className="px-4 py-3 font-semibold">{T.details[locale]}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {entries.map((entry) => (
              <tr key={entry.id} className={SENSITIVE.has(entry.action) ? 'bg-amber-50/60' : ''}>
                <td className="whitespace-nowrap px-4 py-2.5 text-muted">{formatDateTime(entry.createdAt)}</td>
                <td className="px-4 py-2.5 font-mono">{entry.userLogin ?? '—'}</td>
                <td className="px-4 py-2.5 font-semibold">{ACTION_LABEL[entry.action]?.[locale] ?? entry.action}</td>
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
          {page > 1 ? <a href={`?page=${page - 1}`} className="btn-secondary">{T.prev[locale]}</a> : null}
          <span className="text-muted">Страница {page} из {pages}</span>
          {page < pages ? <a href={`?page=${page + 1}`} className="btn-secondary">{T.next[locale]}</a> : null}
        </div>
      ) : null}
    </>
  );
}
