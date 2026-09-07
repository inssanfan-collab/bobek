import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/server/db';
import { requireSuperadmin } from '@/server/auth/guards';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { Alert } from '@/components/ui/Alert';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { env } from '@/lib/env';
import { subscriptionState } from '@/server/subscription';
import {
  formatDate, formatDateTime, formatMoney, KIND_LABEL, ROLE_LABEL, STATUS_LABEL, STATUS_TONE,
} from '@/lib/labels';
import {
  addDomain, deleteDomain, impersonate, recordPayment, resetUserPassword,
  setPrimaryDomain, setTenantStatus, verifyDomain,
} from '../actions';

export const dynamic = 'force-dynamic';

export default async function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await params;

  const [tenant, csrf] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id },
      include: {
        profile: true,
        domains: { orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }] },
        users: { orderBy: { createdAt: 'asc' } },
        payments: { orderBy: { paidAt: 'desc' }, take: 10 },
        _count: { select: { posts: true, media: true, documents: true, feedback: true } },
      },
    }),
    csrfToken(),
  ]);

  if (!tenant) notFound();

  const subscription = await subscriptionState(tenant.id);
  const primary = tenant.domains.find((d) => d.isPrimary) ?? tenant.domains[0];

  return (
    <>
      <PageHeader
        title={tenant.profile?.nameRu ?? tenant.slug}
        description={tenant.profile?.kind ? KIND_LABEL[tenant.profile.kind] : undefined}
        action={
          <div className="flex flex-wrap gap-2">
            {primary ? (
              <a href={`https://${primary.host}`} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                Открыть сайт
              </a>
            ) : null}
            <form action={impersonate}>
              <input type="hidden" name={CSRF_FIELD} value={csrf} />
              <input type="hidden" name="tenantId" value={tenant.id} />
              <button type="submit" className="btn-primary">Войти как сад</button>
            </form>
          </div>
        }
      />

      <Alert tone="info">
        Вход «под садом» фиксируется в журнале действий вместе с вашим логином.
      </Alert>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="font-display text-lg font-bold">Статус и подписка</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="w-40 text-muted">Текущий статус</span>
              <span className={`badge ${STATUS_TONE[tenant.status]}`}>{STATUS_LABEL[tenant.status]}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-40 text-muted">Подписка до</span>
              <strong>{subscription.periodEnd ? formatDate(subscription.periodEnd) : 'не оформлена'}</strong>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-40 text-muted">Режим админки</span>
              <span>
                {subscription.canEdit
                  ? 'полный доступ'
                  : subscription.isGrace
                    ? 'только чтение (льготный период)'
                    : 'заблокирована'}
              </span>
            </div>
          </div>

          {subscription.isGrace ? (
            <div className="mt-4">
              <Alert tone="warn" title="Подписка истекла">
                Сайт работает, админка в режиме только чтения ещё {env.subscriptionGraceDays} дней с даты окончания.
              </Alert>
            </div>
          ) : null}

          <form action={setTenantStatus} className="mt-5 flex flex-wrap items-end gap-3 border-t border-line pt-5">
            <input type="hidden" name={CSRF_FIELD} value={csrf} />
            <input type="hidden" name="tenantId" value={tenant.id} />
            <div>
              <label className="field-label" htmlFor="status">Изменить статус</label>
              <select id="status" name="status" defaultValue={tenant.status} className="field">
                {Object.entries(STATUS_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-secondary">Применить</button>
          </form>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-lg font-bold">Отметить оплату</h2>
          <p className="mt-1 text-sm text-muted">
            Оплата продлевает подписку и снимает приостановку, если она была.
          </p>
          <form action={recordPayment} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input type="hidden" name={CSRF_FIELD} value={csrf} />
            <input type="hidden" name="tenantId" value={tenant.id} />
            <div>
              <label className="field-label" htmlFor="amount">Сумма, ₸</label>
              <input id="amount" name="amount" type="number" min={1} defaultValue={env.subscriptionPrice} className="field" />
            </div>
            <div>
              <label className="field-label" htmlFor="months">Продлить на, мес.</label>
              <input id="months" name="months" type="number" min={1} max={36} defaultValue={12} className="field" />
            </div>
            <div>
              <label className="field-label" htmlFor="method">Способ</label>
              <select id="method" name="method" className="field" defaultValue="kaspi">
                <option value="kaspi">Kaspi</option>
                <option value="invoice">Счёт / безнал</option>
                <option value="cash">Наличные</option>
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="invoiceNo">Номер счёта</label>
              <input id="invoiceNo" name="invoiceNo" className="field" placeholder="необязательно" />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="btn-primary">Записать оплату</button>
            </div>
          </form>

          {tenant.payments.length > 0 ? (
            <ul className="mt-5 space-y-1.5 border-t border-line pt-4 text-sm">
              {tenant.payments.map((payment) => (
                <li key={payment.id} className="flex justify-between gap-3">
                  <span className="text-muted">{formatDate(payment.paidAt)}</span>
                  <span className="font-semibold">{formatMoney(payment.amount)}</span>
                  <span className="text-muted">{payment.method}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section className="card p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-bold">Домены</h2>
          <p className="mt-1 text-sm text-muted">
            Поддомен на портале выдан автоматически. Собственный домен сад покупает сам —
            здесь его нужно добавить и проверить A-запись.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line text-left text-muted">
                <tr>
                  <th className="py-2 pr-4 font-semibold">Домен</th>
                  <th className="py-2 pr-4 font-semibold">Тип</th>
                  <th className="py-2 pr-4 font-semibold">DNS / сертификат</th>
                  <th className="py-2 font-semibold">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {tenant.domains.map((domain) => (
                  <tr key={domain.id}>
                    <td className="py-3 pr-4">
                      <a href={`https://${domain.host}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand">
                        {domain.host}
                      </a>
                      {domain.isPrimary ? <span className="badge ml-2 bg-brand-soft text-brand-ink">основной</span> : null}
                    </td>
                    <td className="py-3 pr-4 text-muted">
                      {domain.type === 'SUBDOMAIN' ? 'поддомен портала' : 'домен сада'}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`badge ${domain.certStatus === 'ACTIVE' || domain.certStatus === 'DNS_OK' ? 'bg-emerald-100 text-emerald-800' : domain.certStatus === 'FAILED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                        {domain.certStatus}
                      </span>
                      {domain.lastError ? <p className="mt-1 text-xs text-muted">{domain.lastError}</p> : null}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        {domain.type === 'CUSTOM' ? (
                          <>
                            <form action={verifyDomain}>
                              <input type="hidden" name={CSRF_FIELD} value={csrf} />
                              <input type="hidden" name="domainId" value={domain.id} />
                              <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">Проверить DNS</button>
                            </form>
                            <form action={deleteDomain}>
                              <input type="hidden" name={CSRF_FIELD} value={csrf} />
                              <input type="hidden" name="domainId" value={domain.id} />
                              <button type="submit" className="btn-ghost px-3 py-1.5 text-xs text-red-600">Удалить</button>
                            </form>
                          </>
                        ) : null}
                        {!domain.isPrimary ? (
                          <form action={setPrimaryDomain}>
                            <input type="hidden" name={CSRF_FIELD} value={csrf} />
                            <input type="hidden" name="domainId" value={domain.id} />
                            <button type="submit" className="btn-ghost px-3 py-1.5 text-xs">Сделать основным</button>
                          </form>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <form action={addDomain} className="mt-5 flex flex-wrap items-end gap-3 border-t border-line pt-5">
            <input type="hidden" name={CSRF_FIELD} value={csrf} />
            <input type="hidden" name="tenantId" value={tenant.id} />
            <div className="min-w-64 flex-1">
              <label className="field-label" htmlFor="host">Собственный домен сада</label>
              <input id="host" name="host" className="field" placeholder="sad12-aqtobe.kz" />
              <p className="field-hint">
                Сад должен прописать A-запись на IP сервера. Домен .kz обязан указывать на сервер в Казахстане.
              </p>
            </div>
            <button type="submit" className="btn-secondary">Добавить домен</button>
          </form>
        </section>

        <section className="card p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-bold">Пользователи сада</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line text-left text-muted">
                <tr>
                  <th className="py-2 pr-4 font-semibold">ФИО</th>
                  <th className="py-2 pr-4 font-semibold">Логин</th>
                  <th className="py-2 pr-4 font-semibold">Роль</th>
                  <th className="py-2 pr-4 font-semibold">Последний вход</th>
                  <th className="py-2 font-semibold">Пароль</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {tenant.users.map((user) => (
                  <tr key={user.id}>
                    <td className="py-3 pr-4 font-semibold">
                      {user.fullName}
                      {!user.isActive ? <span className="badge ml-2 bg-red-100 text-red-800">отключён</span> : null}
                    </td>
                    <td className="py-3 pr-4 font-mono">{user.login}</td>
                    <td className="py-3 pr-4 text-muted">{ROLE_LABEL[user.role]}</td>
                    <td className="py-3 pr-4 text-muted">{user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'ни разу'}</td>
                    <td className="py-3">
                      <form action={resetUserPassword}>
                        <input type="hidden" name={CSRF_FIELD} value={csrf} />
                        <input type="hidden" name="userId" value={user.id} />
                        <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">Сбросить</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link href={`/admin/users?tenantId=${tenant.id}`} className="btn-ghost mt-4">
            Добавить пользователя →
          </Link>
        </section>

        <section className="card p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-bold">Наполнение</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Metric label="Публикаций" value={tenant._count.posts} />
            <Metric label="Файлов" value={tenant._count.media} />
            <Metric label="Документов" value={tenant._count.documents} />
            <Metric label="Обращений" value={tenant._count.feedback} />
          </dl>
        </section>
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-brand-soft/50 p-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="font-display text-2xl font-extrabold">{value}</dd>
    </div>
  );
}
