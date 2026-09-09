import Link from 'next/link';
import { prisma } from '@/server/db';
import { PageHeader, StatCard } from '@/components/admin/AdminShell';
import { expiringSoon } from '@/server/subscription';
import { formatDate, STATUS, STATUS_TONE } from '@/lib/labels';
import { pick } from '@/lib/i18n';
import { requireSuperadmin } from '@/server/auth/guards';
import { Alert } from '@/components/ui/Alert';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Шолу', ru: 'Обзор' },
  lead: {
    kk: 'Портал жағдайы: балабақшалар, жазылымдар және жаңа өтінімдер.',
    ru: 'Состояние портала: сады, подписки и новые заявки.',
  },
  newTenant: { kk: 'Балабақша құру', ru: 'Создать сад' },
  totalGardens: { kk: 'Барлық балабақша', ru: 'Садов всего' },
  working: { kk: 'Жұмыс істейді', ru: 'Работают' },
  inDrafts: { kk: '%s жобада', ru: '%s в черновиках' },
  suspended: { kk: 'Тоқтатылған', ru: 'Приостановлены' },
  suspendedHint: { kk: 'Жазылым ұзартылмаған', ru: 'Подписка не продлена' },
  newLeads: { kk: 'Жаңа өтінімдер', ru: 'Новых заявок' },
  expiring: {
    kk: 'Жақындағы 30 күнде аяқталатын жазылымдар',
    ru: 'Подписки, истекающие в ближайшие 30 дней',
  },
  until: { kk: '%s дейін', ru: 'до %s' },
  overdue: { kk: '%s күнге кешіккен', ru: 'просрочено на %s дн.' },
  daysLeft: { kk: '%s күн қалды', ru: 'осталось %s дн.' },
  allFine: { kk: 'Барлық жазылым тәртіппен', ru: 'Все подписки в порядке' },
  allFineText: { kk: 'Жақындағы 30 күнде ештеңе аяқталмайды.', ru: 'В ближайшие 30 дней ничего не истекает.' },
  recent: { kk: 'Соңғы құрылған балабақшалар', ru: 'Последние созданные сады' },
  none: {
    kk: 'Әзірге бірде-бір балабақша құрылмаған. «Балабақша құру» түймесінен бастаңыз.',
    ru: 'Пока не создано ни одного сада. Начните с кнопки «Создать сад».',
  },
} as const;

export default async function PortalAdminDashboard() {
  const user = await requireSuperadmin();
  const locale = user.locale;

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
        title={T.title[locale]}
        description={T.lead[locale]}
        action={<Link href="/admin/tenants/new" className="btn-primary">{T.newTenant[locale]}</Link>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={T.totalGardens[locale]} value={total} />
        <StatCard
          label={T.working[locale]}
          value={active}
          hint={draft ? T.inDrafts[locale].replace('%s', String(draft)) : undefined}
        />
        <StatCard label={T.suspended[locale]} value={suspended} hint={T.suspendedHint[locale]} />
        <StatCard label={T.newLeads[locale]} value={leads} />
      </div>

      {expiring.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-3 font-display text-lg font-bold">{T.expiring[locale]}</h2>
          <div className="card divide-y divide-line">
            {expiring.map((sub) => {
              const daysLeft = Math.ceil((sub.periodEnd.getTime() - Date.now()) / 86_400_000);
              return (
                <div key={sub.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <Link href={`/admin/tenants/${sub.tenantId}`} className="font-semibold hover:text-brand">
                    {pick(locale, sub.tenant.profile?.nameKk, sub.tenant.profile?.nameRu) || sub.tenant.slug}
                  </Link>
                  <span className="text-sm text-muted">{T.until[locale].replace('%s', formatDate(sub.periodEnd, locale))}</span>
                  <span
                    className={`badge ml-auto ${daysLeft < 0 ? 'bg-red-100 text-red-800' : daysLeft <= 7 ? 'bg-amber-100 text-amber-800' : 'bg-brand-soft text-brand-ink'}`}
                  >
                    {daysLeft < 0
                      ? T.overdue[locale].replace('%s', String(-daysLeft))
                      : T.daysLeft[locale].replace('%s', String(daysLeft))}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <div className="mt-8">
          <Alert tone="success" title={T.allFine[locale]}>
            {T.allFineText[locale]}
          </Alert>
        </div>
      )}

      <section className="mt-8">
        <h2 className="mb-3 font-display text-lg font-bold">{T.recent[locale]}</h2>
        {recent.length === 0 ? (
          <Alert tone="info">{T.none[locale]}</Alert>
        ) : (
          <div className="card divide-y divide-line">
            {recent.map((tenant) => (
              <div key={tenant.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <Link href={`/admin/tenants/${tenant.id}`} className="font-semibold hover:text-brand">
                  {pick(locale, tenant.profile?.nameKk, tenant.profile?.nameRu) || tenant.slug}
                </Link>
                <span className="text-sm text-muted">{tenant.slug}</span>
                <span className={`badge ml-auto ${STATUS_TONE[tenant.status]}`}>{STATUS[tenant.status][locale]}</span>
                <span className="text-sm text-muted">{formatDate(tenant.createdAt, locale)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
