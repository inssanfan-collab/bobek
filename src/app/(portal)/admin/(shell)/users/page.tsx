import { prisma } from '@/server/db';
import { requireSuperadmin } from '@/server/auth/guards';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { Alert } from '@/components/ui/Alert';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { formatDateTime, ROLE } from '@/lib/labels';
import { NewUserForm } from './NewUserForm';
import { resetUserPassword, toggleUserActive } from '../tenants/actions';
import { pick } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Пайдаланушылар', ru: 'Пользователи' },
  lead: {
    kk: 'Барлық кіру деректерін портал әкімшісі жасайды және қалпына келтіреді.',
    ru: 'Все доступы создаёт и восстанавливает администратор портала.',
  },
  resetDone: { kk: '«%s» үшін құпия сөз тасталды', ru: 'Пароль для «%s» сброшен' },
  newPassword: { kk: 'Жаңа құпия сөз: ', ru: 'Новый пароль: ' },
  dictate: {
    kk: 'Оны қызметкерге айтыңыз. Кіру кезінде жүйе құпия сөзді ауыстыруды сұрайды. Бұл пайдаланушының бұрынғы сеанстарының бәрі жабылды.',
    ru: 'Продиктуйте его сотруднику. При входе система попросит сменить пароль. Все прежние сессии этого пользователя закрыты.',
  },
  fullName: { kk: 'Аты-жөні', ru: 'ФИО' },
  login: { kk: 'Логин', ru: 'Логин' },
  garden: { kk: 'Балабақша', ru: 'Сад' },
  role: { kk: 'Рөлі', ru: 'Роль' },
  lastLogin: { kk: 'Соңғы кіру', ru: 'Последний вход' },
  actions: { kk: 'Әрекеттер', ru: 'Действия' },
  never: { kk: 'бірде-бір рет', ru: 'ни разу' },
  resetPassword: { kk: 'Құпия сөзді тастау', ru: 'Сбросить пароль' },
  disable: { kk: 'Өшіру', ru: 'Отключить' },
  enable: { kk: 'Қосу', ru: 'Включить' },
} as const;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ tenantId?: string; reset?: string; password?: string }>;
}) {
  const user = await requireSuperadmin();
  const locale = user.locale;
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
        title={T.title[locale]}
        description={T.lead[locale]}
      />

      {params.reset && params.password ? (
        <div className="mb-6">
          <Alert tone="success" title={T.resetDone[locale].replace('%s', params.reset)}>
            <p>{T.newPassword[locale]}<strong className="font-mono text-base">{params.password}</strong></p>
            <p className="mt-1">
              {T.dictate[locale]}
            </p>
          </Alert>
        </div>
      ) : null}

      <div className="mb-6">
        <NewUserForm
          csrf={csrf}
          locale={locale}
          defaultTenantId={params.tenantId}
          tenants={tenants.map((t) => ({ id: t.id, label: pick(locale, t.profile?.nameKk, t.profile?.nameRu) || t.slug }))}
        />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">{T.fullName[locale]}</th>
              <th className="px-4 py-3 font-semibold">{T.login[locale]}</th>
              <th className="px-4 py-3 font-semibold">{T.garden[locale]}</th>
              <th className="px-4 py-3 font-semibold">{T.role[locale]}</th>
              <th className="px-4 py-3 font-semibold">{T.lastLogin[locale]}</th>
              <th className="px-4 py-3 font-semibold">{T.actions[locale]}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((user) => (
              <tr key={user.id} className={user.isActive ? '' : 'opacity-60'}>
                <td className="px-4 py-3 font-semibold">{user.fullName}</td>
                <td className="px-4 py-3 font-mono">{user.login}</td>
                <td className="px-4 py-3 text-muted">{pick(locale, user.tenant?.profile?.nameKk, user.tenant?.profile?.nameRu) || user.tenant?.slug || '—'}</td>
                <td className="px-4 py-3 text-muted">{ROLE[user.role][locale]}</td>
                <td className="px-4 py-3 text-muted">{user.lastLoginAt ? formatDateTime(user.lastLoginAt, locale) : T.never[locale]}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <form action={resetUserPassword}>
                      <input type="hidden" name={CSRF_FIELD} value={csrf} />
                      <input type="hidden" name="userId" value={user.id} />
                      <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">{T.resetPassword[locale]}</button>
                    </form>
                    {user.role !== 'SUPERADMIN' ? (
                      <form action={toggleUserActive}>
                        <input type="hidden" name={CSRF_FIELD} value={csrf} />
                        <input type="hidden" name="userId" value={user.id} />
                        <button type="submit" className="btn-ghost px-3 py-1.5 text-xs">
                          {user.isActive ? T.disable[locale] : T.enable[locale]}
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
