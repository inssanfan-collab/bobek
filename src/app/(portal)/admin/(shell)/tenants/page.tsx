import Link from 'next/link';
import { prisma } from '@/server/db';
import { PageHeader } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate, STATUS, STATUS_TONE, KIND } from '@/lib/labels';
import { pick } from '@/lib/i18n';
import { requireSuperadmin } from '@/server/auth/guards';
import type { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Балабақшалар', ru: 'Детские сады' },
  total: { kk: 'Барлығы: %s', ru: 'Всего: %s' },
  create: { kk: 'Балабақша құру', ru: 'Создать сад' },
  search: { kk: 'Іздеу', ru: 'Поиск' },
  searchExample: { kk: 'Атауы немесе мекенжайы', ru: 'Название или адрес' },
  status: { kk: 'Мәртебесі', ru: 'Статус' },
  exceptArchive: { kk: 'Мұрағаттан басқа', ru: 'Кроме архива' },
  show: { kk: 'Көрсету', ru: 'Показать' },
  empty: { kk: 'Әзірге балабақшалар жоқ', ru: 'Садов пока нет' },
  emptyHint: {
    kk: 'Алғашқы балабақшаны құрыңыз — ол мекенжай, әкімші бөлімі және бір жылдық жазылым алады.',
    ru: 'Создайте первый сад — он получит адрес, админку и подписку на год.',
  },
  garden: { kk: 'Балабақша', ru: 'Сад' },
  address: { kk: 'Мекенжай', ru: 'Адрес' },
  subscriptionUntil: { kk: 'Жазылым мерзімі', ru: 'Подписка до' },
  posts: { kk: 'Жарияланым', ru: 'Публикаций' },
  handouts: { kk: 'Балабақшаларға арналған материалдар', ru: 'Материалы для садов' },
  anketa: { kk: 'Сауалнама (Excel)', ru: 'Анкета (Excel)' },
  guide: { kk: 'Нұсқаулық (PDF)', ru: 'Инструкция (PDF)' },
  handoutsHint: {
    kk: 'Қосылуға дейін сауалнаманы, кіру деректерімен бірге нұсқаулықты жіберіңіз.',
    ru: 'Анкету отправляйте до подключения, инструкцию — вместе с доступами.',
  },
} as const;

export default async function TenantsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const user = await requireSuperadmin();
  const locale = user.locale;

  const params = await searchParams;
  const query = params.q?.trim() ?? '';

  const where: Prisma.TenantWhereInput = {
    ...(params.status ? { status: params.status as never } : { status: { not: 'ARCHIVED' } }),
    ...(query
      ? {
          OR: [
            { slug: { contains: query, mode: 'insensitive' } },
            { profile: { nameRu: { contains: query, mode: 'insensitive' } } },
            { profile: { nameKk: { contains: query, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };

  const tenants = await prisma.tenant.findMany({
    where,
    include: {
      profile: true,
      domains: { orderBy: [{ isPrimary: 'desc' }] },
      subscriptions: { where: { isCurrent: true }, take: 1 },
      _count: { select: { users: true, posts: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <PageHeader
        title={T.title[locale]}
        description={T.total[locale].replace('%s', String(tenants.length))}
        action={<Link href="/admin/tenants/new" className="btn-primary">{T.create[locale]}</Link>}
      />

      {/* Оба файла раздаются садам руками, поэтому лежат там, где заводят сад */}
      <div className="card mb-6 flex flex-wrap items-center gap-3 p-4">
        <span className="font-semibold">{T.handouts[locale]}:</span>
        <a href="/downloads/bobegim-anketa.xlsx" className="btn-secondary text-sm" download>
          {T.anketa[locale]}
        </a>
        <a href="/downloads/bobegim-instrukciya.pdf" className="btn-secondary text-sm" download>
          {T.guide[locale]}
        </a>
        <span className="text-sm text-muted">{T.handoutsHint[locale]}</span>
      </div>

      <form className="card mb-6 flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-48 flex-1">
          <label className="field-label" htmlFor="q">{T.search[locale]}</label>
          <input id="q" name="q" defaultValue={query} className="field" placeholder={T.searchExample[locale]} />
        </div>
        <div>
          <label className="field-label" htmlFor="status">{T.status[locale]}</label>
          <select id="status" name="status" defaultValue={params.status ?? ''} className="field">
            <option value="">{T.exceptArchive[locale]}</option>
            {Object.entries(STATUS).map(([value, phrase]) => (
              <option key={value} value={value}>{phrase[locale]}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-secondary">{T.show[locale]}</button>
      </form>

      {tenants.length === 0 ? (
        <EmptyState
          icon="🏡"
          title={T.empty[locale]}
          description={T.emptyHint[locale]}
          action={<Link href="/admin/tenants/new" className="btn-primary mt-2">{T.create[locale]}</Link>}
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-line text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">{T.garden[locale]}</th>
                <th className="px-4 py-3 font-semibold">{T.address[locale]}</th>
                <th className="px-4 py-3 font-semibold">{T.status[locale]}</th>
                <th className="px-4 py-3 font-semibold">{T.subscriptionUntil[locale]}</th>
                <th className="px-4 py-3 font-semibold">{T.posts[locale]}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {tenants.map((tenant) => {
                const primary = tenant.domains.find((d) => d.isPrimary) ?? tenant.domains[0];
                const sub = tenant.subscriptions[0];
                const expired = sub ? sub.periodEnd.getTime() < Date.now() : false;
                return (
                  <tr key={tenant.id} className="hover:bg-brand-soft/40">
                    <td className="px-4 py-3">
                      <Link href={`/admin/tenants/${tenant.id}`} className="font-semibold hover:text-brand">
                        {pick(locale, tenant.profile?.nameKk, tenant.profile?.nameRu) || tenant.slug}
                      </Link>
                      {tenant.profile?.kind ? (
                        <p className="text-xs text-muted">{KIND[tenant.profile.kind][locale]}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      {primary ? (
                        <a href={`https://${primary.host}`} target="_blank" rel="noopener noreferrer" className="text-brand">
                          {primary.host}
                        </a>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${STATUS_TONE[tenant.status]}`}>{STATUS[tenant.status][locale]}</span>
                    </td>
                    <td className={`px-4 py-3 ${expired ? 'font-semibold text-red-600' : ''}`}>
                      {sub ? formatDate(sub.periodEnd, locale) : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted">{tenant._count.posts}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
