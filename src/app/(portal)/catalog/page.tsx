import type { Metadata } from 'next';
import { prisma } from '@/server/db';
import { searchTenantIds } from '@/server/db/search';
import { env } from '@/lib/env';
import { EmptyState } from '@/components/ui/EmptyState';
import { KIND_LABEL } from '@/lib/labels';
import type { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Каталог детских садов Актобе',
  description:
    'Детские сады и мини-центры Актобе: адреса, телефоны, язык обучения, свободные места и ссылки на официальные сайты.',
};

type Search = { q?: string; district?: string; kind?: string; free?: string };

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? '';

  // Поиск отдаёт id по релевантности, фильтры остаются на стороне Prisma:
  // ранжировать по совпадению и одновременно фильтровать по району в одном
  // запросе можно, но тогда условия каталога расползаются по сырому SQL.
  const ranked = query ? await searchTenantIds(query) : null;

  const where: Prisma.TenantWhereInput = {
    status: 'ACTIVE',
    ...(ranked ? { id: { in: ranked } } : {}),
    profile: {
      ...(params.district ? { district: params.district } : {}),
      ...(params.kind ? { kind: params.kind as never } : {}),
      ...(params.free === '1' ? { placesFree: { gt: 0 } } : {}),
    },
  };

  const [found, districts] = await Promise.all([
    prisma.tenant.findMany({
      where,
      include: { profile: true, domains: { where: { isPrimary: true }, take: 1 } },
      orderBy: { slug: 'asc' },
      take: 200,
    }),
    prisma.tenantProfile.findMany({
      where: { district: { not: null }, tenant: { status: 'ACTIVE' } },
      select: { district: true },
      distinct: ['district'],
      orderBy: { district: 'asc' },
    }),
  ]);

  // Порядок задаёт релевантность, а без запроса — алфавит.
  const gardens = ranked
    ? [...found].sort((a, b) => ranked.indexOf(a.id) - ranked.indexOf(b.id))
    : found;

  return (
    <div className="container-page py-12">
      <h1 className="font-display text-4xl font-extrabold">Детские сады Актобе</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Официальные сайты садов на портале. Чтобы встать в очередь, воспользуйтесь{' '}
        <a href="https://egov.kz/cms/ru/articles/child/2Fdetskiii_sad_rk" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand underline">
          услугой на egov.kz
        </a>
        .
      </p>

      <form className="card mt-8 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4" role="search">
        <div>
          <label className="field-label" htmlFor="q">Название, адрес или район</label>
          <input id="q" name="q" defaultValue={query} className="field" placeholder="Например: Балдырған" />
        </div>
        <div>
          <label className="field-label" htmlFor="district">Район</label>
          <select id="district" name="district" defaultValue={params.district ?? ''} className="field">
            <option value="">Все районы</option>
            {districts.map((d) => (
              <option key={d.district} value={d.district ?? ''}>{d.district}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="kind">Тип</label>
          <select id="kind" name="kind" defaultValue={params.kind ?? ''} className="field">
            <option value="">Любой</option>
            {Object.entries(KIND_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-3">
          <label className="flex flex-1 items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="free" value="1" defaultChecked={params.free === '1'} className="h-4 w-4" />
            Есть места
          </label>
          <button type="submit" className="btn-primary">Найти</button>
        </div>
      </form>

      {gardens.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon="🔍"
            title="Ничего не найдено"
            description="Попробуйте изменить условия поиска или посмотрите весь список без фильтров."
          />
        </div>
      ) : (
        <>
          <p className="mt-8 text-sm text-muted">Найдено садов: {gardens.length}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gardens.map((tenant) => {
              const p = tenant.profile;
              const host = tenant.domains[0]?.host ?? `${tenant.slug}.${env.portalDomain}`;
              return (
                <article key={tenant.id} className="card flex flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-display text-lg font-bold">{p?.nameRu ?? tenant.slug}</h2>
                    {p?.isPrivate ? (
                      <span className="badge bg-accent/15 text-accent">Частный</span>
                    ) : (
                      <span className="badge bg-brand-soft text-brand-ink">Гос.</span>
                    )}
                  </div>
                  {p?.kind ? <p className="mt-1 text-sm text-muted">{KIND_LABEL[p.kind]}</p> : null}
                  {p?.addressRu ? <p className="mt-2 text-sm">{p.addressRu}</p> : null}
                  {p?.phone ? (
                    <p className="mt-1 text-sm">
                      <a href={`tel:${p.phone.replace(/\s/g, '')}`} className="font-semibold text-brand">{p.phone}</a>
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {p?.langKk ? <span className="badge bg-brand-soft text-brand-ink">Қазақша</span> : null}
                    {p?.langRu ? <span className="badge bg-brand-soft text-brand-ink">Русский</span> : null}
                    {p?.placesFree ? (
                      <span className="badge bg-emerald-100 text-emerald-800">Свободно мест: {p.placesFree}</span>
                    ) : null}
                  </div>
                  <a href={`https://${host}`} className="btn-secondary mt-4 self-start text-sm">
                    Открыть сайт →
                  </a>
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
