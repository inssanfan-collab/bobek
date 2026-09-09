import Link from 'next/link';
import { prisma } from '@/server/db';
import { requireSuperadmin } from '@/server/auth/guards';
import { PageHeader, StatCard } from '@/components/admin/AdminShell';
import { formatDate, formatMoney } from '@/lib/labels';
import { env } from '@/lib/env';
import { pick } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Жазылымдар', ru: 'Подписки' },
  lead: { kk: 'Төлемдер балабақша карточкасында белгіленеді.', ru: 'Оплаты отмечаются в карточке сада.' },
  active: { kk: 'Белсенді жазылым', ru: 'Активных подписок' },
  inGrace: { kk: 'Жеңілдік кезеңінде', ru: 'В льготном периоде' },
  inGraceHint: { kk: 'әкімші бөлімі тек оқуға', ru: 'админка только на чтение' },
  income: { kk: 'Жыл ішінде түсті', ru: 'Поступило за год' },
  garden: { kk: 'Балабақша', ru: 'Сад' },
  period: { kk: 'Кезең', ru: 'Период' },
  left: { kk: 'Қалды', ru: 'Осталось' },
  amount: { kk: 'Сомасы', ru: 'Сумма' },
} as const;

export default async function SubscriptionsPage() {
  const user = await requireSuperadmin();
  const locale = user.locale;

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
      <PageHeader title={T.title[locale]} description={T.lead[locale]} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={T.active[locale]} value={subs.length - expired.length - inGrace.length} />
        <StatCard label={T.inGrace[locale]} value={inGrace.length} hint={T.inGraceHint[locale]} />
        <StatCard label={T.income[locale]} value={formatMoney(paidThisYear._sum.amount ?? 0)} />
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">{T.garden[locale]}</th>
              <th className="px-4 py-3 font-semibold">{T.period[locale]}</th>
              <th className="px-4 py-3 font-semibold">{T.left[locale]}</th>
              <th className="px-4 py-3 font-semibold">{T.amount[locale]}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {subs.map((sub) => {
              const daysLeft = Math.ceil((sub.periodEnd.getTime() - now) / 86_400_000);
              return (
                <tr key={sub.id}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/tenants/${sub.tenantId}`} className="font-semibold hover:text-brand">
                      {pick(locale, sub.tenant.profile?.nameKk, sub.tenant.profile?.nameRu) || sub.tenant.slug}
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
