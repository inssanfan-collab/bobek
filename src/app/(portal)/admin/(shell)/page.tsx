import Link from 'next/link';
import { prisma } from '@/server/db';
import { PageHeader, StatCard } from '@/components/admin/AdminShell';
import { expiringSoon } from '@/server/subscription';
import { formatDate, STATUS_LABEL, STATUS_TONE } from '@/lib/labels';
import { Alert } from '@/components/ui/Alert';

export const dynamic = 'force-dynamic';

export default async function PortalAdminDashboard() {
  const [total, active, draft, suspended, leads, expiring, recent] = await Promise.all([
    prisma.tenant.count({ where: { status: { not: 'ARCHIVED' } } }),
    prisma.tenant.count({ where: { status: 'ACTIVE' } }),
    prisma.tenant.count({ where: { status: 'DRAFT' } }),
    prisma.tenant.count({ where: { status: 'SUSPENDED' } }),
    prisma.lead.count({ where: { isHandled: false } }),
    expiringSoon(30),
    prisma.tenant.findMany({
      where: { status: { not: 'ARCHIVED' } },
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Обзор"
        description="Состояние портала: сады, подписки и новые заявки."
        action={<Link href="/admin/tenants/new" className="btn-primary">Создать сад</Link>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Садов всего" value={total} />
        <StatCard label="Работают" value={active} hint={draft ? `${draft} в черновиках` : undefined} />
        <StatCard label="Приостановлены" value={suspended} hint="Подписка не продлена" />
        <StatCard label="Новых заявок" value={leads} />
      </div>

      {expiring.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-3 font-display text-lg font-bold">Подписки, истекающие в ближайшие 30 дней</h2>
          <div className="card divide-y divide-line">
            {expiring.map((sub) => {
              const daysLeft = Math.ceil((sub.periodEnd.getTime() - Date.now()) / 86_400_000);
              return (
                <div key={sub.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <Link href={`/admin/tenants/${sub.tenantId}`} className="font-semibold hover:text-brand">
                    {sub.tenant.profile?.nameRu ?? sub.tenant.slug}
                  </Link>
                  <span className="text-sm text-muted">до {formatDate(sub.periodEnd)}</span>
                  <span
                    className={`badge ml-auto ${daysLeft < 0 ? 'bg-red-100 text-red-800' : daysLeft <= 7 ? 'bg-amber-100 text-amber-800' : 'bg-brand-soft text-brand-ink'}`}
                  >
                    {daysLeft < 0 ? `просрочено на ${-daysLeft} дн.` : `осталось ${daysLeft} дн.`}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <div className="mt-8">
          <Alert tone="success" title="Все подписки в порядке">
            В ближайшие 30 дней ничего не истекает.
          </Alert>
        </div>
      )}

      <section className="mt-8">
        <h2 className="mb-3 font-display text-lg font-bold">Последние созданные сады</h2>
        {recent.length === 0 ? (
          <Alert tone="info">Пока не создано ни одного сада. Начните с кнопки «Создать сад».</Alert>
        ) : (
          <div className="card divide-y divide-line">
            {recent.map((tenant) => (
              <div key={tenant.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <Link href={`/admin/tenants/${tenant.id}`} className="font-semibold hover:text-brand">
                  {tenant.profile?.nameRu ?? tenant.slug}
                </Link>
                <span className="text-sm text-muted">{tenant.slug}</span>
                <span className={`badge ml-auto ${STATUS_TONE[tenant.status]}`}>{STATUS_LABEL[tenant.status]}</span>
                <span className="text-sm text-muted">{formatDate(tenant.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
