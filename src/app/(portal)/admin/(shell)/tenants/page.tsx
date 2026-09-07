import Link from 'next/link';
import { prisma } from '@/server/db';
import { PageHeader } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate, STATUS_LABEL, STATUS_TONE, KIND_LABEL } from '@/lib/labels';
import type { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function TenantsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
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
        title="Детские сады"
        description={`Всего: ${tenants.length}`}
        action={<Link href="/admin/tenants/new" className="btn-primary">Создать сад</Link>}
      />

      <form className="card mb-6 flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-48 flex-1">
          <label className="field-label" htmlFor="q">Поиск</label>
          <input id="q" name="q" defaultValue={query} className="field" placeholder="Название или адрес" />
        </div>
        <div>
          <label className="field-label" htmlFor="status">Статус</label>
          <select id="status" name="status" defaultValue={params.status ?? ''} className="field">
            <option value="">Кроме архива</option>
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-secondary">Показать</button>
      </form>

      {tenants.length === 0 ? (
        <EmptyState
          icon="🏡"
          title="Садов пока нет"
          description="Создайте первый сад — он получит адрес, админку и подписку на год."
          action={<Link href="/admin/tenants/new" className="btn-primary mt-2">Создать сад</Link>}
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-line text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Сад</th>
                <th className="px-4 py-3 font-semibold">Адрес</th>
                <th className="px-4 py-3 font-semibold">Статус</th>
                <th className="px-4 py-3 font-semibold">Подписка до</th>
                <th className="px-4 py-3 font-semibold">Публикаций</th>
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
                        {tenant.profile?.nameRu ?? tenant.slug}
                      </Link>
                      {tenant.profile?.kind ? (
                        <p className="text-xs text-muted">{KIND_LABEL[tenant.profile.kind]}</p>
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
                      <span className={`badge ${STATUS_TONE[tenant.status]}`}>{STATUS_LABEL[tenant.status]}</span>
                    </td>
                    <td className={`px-4 py-3 ${expired ? 'font-semibold text-red-600' : ''}`}>
                      {sub ? formatDate(sub.periodEnd) : '—'}
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
