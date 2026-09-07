import Link from 'next/link';
import { prisma } from '@/server/db';
import { requireSuperadmin } from '@/server/auth/guards';
import { PageHeader, StatCard } from '@/components/admin/AdminShell';
import { formatDate, formatMoney } from '@/lib/labels';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

export default async function SubscriptionsPage() {
  await requireSuperadmin();

  const [subs, paidThisYear] = await Promise.all([
    prisma.subscription.findMany({
      where: { isCurrent: true, tenant: { status: { not: 'ARCHIVED' } } },
      include: { tenant: { include: { profile: true } } },
      orderBy: { periodEnd: 'asc' },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { paidAt: { gte: new Date(new Date().getFullYear(), 0, 1) } },
    }),
  ]);

  const now = Date.now();
  const graceMs = env.subscriptionGraceDays * 86_400_000;
  const expired = subs.filter((s) => s.periodEnd.getTime() + graceMs < now);
  const inGrace = subs.filter((s) => s.periodEnd.getTime() < now && s.periodEnd.getTime() + graceMs >= now);

  return (
    <>
      <PageHeader title="Подписки" description="Оплаты отмечаются в карточке сада." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Активных подписок" value={subs.length - expired.length - inGrace.length} />
        <StatCard label="В льготном периоде" value={inGrace.length} hint="админка только на чтение" />
        <StatCard label="Поступило за год" value={formatMoney(paidThisYear._sum.amount ?? 0)} />
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Сад</th>
              <th className="px-4 py-3 font-semibold">Период</th>
              <th className="px-4 py-3 font-semibold">Осталось</th>
              <th className="px-4 py-3 font-semibold">Сумма</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {subs.map((sub) => {
              const daysLeft = Math.ceil((sub.periodEnd.getTime() - now) / 86_400_000);
              return (
                <tr key={sub.id}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/tenants/${sub.tenantId}`} className="font-semibold hover:text-brand">
                      {sub.tenant.profile?.nameRu ?? sub.tenant.slug}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {formatDate(sub.periodStart)} — {formatDate(sub.periodEnd)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`badge ${daysLeft < 0 ? 'bg-red-100 text-red-800' : daysLeft <= 30 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}
                    >
                      {daysLeft < 0 ? `просрочено ${-daysLeft} дн.` : `${daysLeft} дн.`}
                    </span>
                  </td>
                  <td className="px-4 py-3">{formatMoney(sub.amount)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
