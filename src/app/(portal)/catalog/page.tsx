import type { Metadata } from 'next';
import { prisma } from '@/server/db';
import { searchTenantIds } from '@/server/db/search';
import { env } from '@/lib/env';
import { EmptyState } from '@/components/ui/EmptyState';
import { CatalogMap } from '@/components/portal/CatalogMap';
import { PortalPage } from '@/components/portal/PortalChrome';
import { localeFromParam, pick } from '@/lib/i18n';
import { KIND } from '@/lib/labels';
import type { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const locale = localeFromParam((await searchParams).lang);
  return {
    title: locale === 'kk' ? 'Ақтөбе балабақшаларының каталогы' : 'Каталог детских садов Актобе',
    description: locale === 'kk' ? 'Ақтөбенің балабақшалары мен шағын орталықтары: мекенжайлары, телефондары, оқыту тілі, бос орындар және ресми сайттарға сілтемелер.' : 'Детские сады и мини-центры Актобе: адреса, телефоны, язык обучения, свободные места и ссылки на официальные сайты.',
  };
}

const T = {
  title: { kk: 'Ақтөбе балабақшалары', ru: 'Детские сады Актобе' },
  leadBefore: {
    kk: 'Порталдағы балабақшалардың ресми сайттары. Кезекке тұру үшін ',
    ru: 'Официальные сайты садов на портале. Чтобы встать в очередь, воспользуйтесь ',
  },
  queueLink: { kk: 'Darabala.kz қызметін пайдаланыңыз', ru: 'услугой на Darabala.kz' },
  searchLabel: { kk: 'Атауы, мекенжайы немесе ауданы', ru: 'Название, адрес или район' },
  searchExample: { kk: 'Мысалы: Балдырған', ru: 'Например: Балдырған' },
  district: { kk: 'Аудан', ru: 'Район' },
  allDistricts: { kk: 'Барлық аудан', ru: 'Все районы' },
  kind: { kk: 'Түрі', ru: 'Тип' },
  anyKind: { kk: 'Кез келген', ru: 'Любой' },
  hasPlaces: { kk: 'Орын бар', ru: 'Есть места' },
  find: { kk: 'Іздеу', ru: 'Найти' },
  nothing: { kk: 'Ештеңе табылмады', ru: 'Ничего не найдено' },
  nothingHint: {
    kk: 'Іздеу шарттарын өзгертіп көріңіз немесе сүзгісіз толық тізімді қараңыз.',
    ru: 'Попробуйте изменить условия поиска или посмотрите весь список без фильтров.',
  },
  found: { kk: 'Табылған балабақша: %s', ru: 'Найдено садов: %s' },
  markTitle: { kk: 'Картадағы белгінің нөмірі', ru: 'Номер метки на карте' },
  private: { kk: 'Жеке', ru: 'Частный' },
  state: { kk: 'Мем.', ru: 'Гос.' },
  freePlaces: { kk: 'Бос орын: %s', ru: 'Свободно мест: %s' },
  openSite: { kk: 'Сайтты ашу →', ru: 'Открыть сайт →' },
} as const;

type Search = { q?: string; district?: string; kind?: string; free?: string; lang?: string };

/** Собственный домен сада, если куплен, иначе выданный поддомен портала. */
function siteHost(tenant: { slug: string; domains: { host: string }[] }): string {
  return tenant.domains[0]?.host ?? `${tenant.slug}.${env.portalDomain}`;
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const locale = localeFromParam(params.lang);
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

  // Нумерация общая с картой: метка «3» и карточка «3» — один и тот же сад.
  // Сады без координат номера не получают, их на карте нет.
  const numbers = new Map<string, number>();
  const mapGardens = gardens.flatMap((tenant) => {
    const p = tenant.profile;
    if (p?.lat == null || p?.lng == null) return [];

    const number = numbers.size + 1;
    numbers.set(tenant.id, number);

    return [{
      lat: p.lat,
      lng: p.lng,
      number,
      name: p.nameRu ?? tenant.slug,
      address: p.addressRu ?? '',
      href: `https://${siteHost(tenant)}`,
    }];
  });

  return (
    <PortalPage locale={locale} pathname="/catalog">
      <div className="container-page py-12">
      <h1 className="font-display text-4xl font-extrabold">{T.title[locale]}</h1>
      <p className="mt-2 max-w-2xl text-muted">
        {T.leadBefore[locale]}
        <a href="https://darabala.kz" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand underline">
          {T.queueLink[locale]}
        </a>
        .
      </p>

      <form className="card mt-8 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4" role="search">
        <div>
          <label className="field-label" htmlFor="q">{T.searchLabel[locale]}</label>
          <input id="q" name="q" defaultValue={query} className="field" placeholder={T.searchExample[locale]} />
        </div>
        <div>
          <label className="field-label" htmlFor="district">{T.district[locale]}</label>
          <select id="district" name="district" defaultValue={params.district ?? ''} className="field">
            <option value="">{T.allDistricts[locale]}</option>
            {districts.map((d) => (
              <option key={d.district} value={d.district ?? ''}>{d.district}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="kind">{T.kind[locale]}</label>
          <select id="kind" name="kind" defaultValue={params.kind ?? ''} className="field">
            <option value="">{T.anyKind[locale]}</option>
            {Object.entries(KIND).map(([value, phrase]) => (
              <option key={value} value={value}>{phrase[locale]}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-3">
          <label className="flex flex-1 items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="free" value="1" defaultChecked={params.free === '1'} className="h-4 w-4" />
            {T.hasPlaces[locale]}
          </label>
          <button type="submit" className="btn-primary">{T.find[locale]}</button>
        </div>
      </form>

      <CatalogMap gardens={mapGardens} />

      {gardens.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon="🔍"
            title={T.nothing[locale]}
            description={T.nothingHint[locale]}
          />
        </div>
      ) : (
        <>
          <p className="mt-8 text-sm text-muted">{T.found[locale].replace('%s', String(gardens.length))}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gardens.map((tenant) => {
              const p = tenant.profile;
              const host = siteHost(tenant);
              const number = numbers.get(tenant.id);
              return (
                <article key={tenant.id} className="card flex flex-col overflow-hidden p-0">
                  {p?.coverMediaId ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/api/media/${p.coverMediaId}`} alt="" className="h-36 w-full object-cover" />
                  ) : null}
                  <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-display text-lg font-bold">
                      {number ? (
                        <span
                          className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand text-sm text-white"
                          title={T.markTitle[locale]}
                        >
                          {number}
                        </span>
                      ) : null}
                      {p?.nameRu ?? tenant.slug}
                    </h2>
                    {p?.isPrivate ? (
                      <span className="badge bg-accent/15 text-accent">{T.private[locale]}</span>
                    ) : (
                      <span className="badge bg-brand-soft text-brand-ink">{T.state[locale]}</span>
                    )}
                  </div>
                  {p?.kind ? <p className="mt-1 text-sm text-muted">{KIND[p.kind][locale]}</p> : null}
                  {pick(locale, p?.addressKk, p?.addressRu) ? (
                    <p className="mt-2 text-sm">{pick(locale, p?.addressKk, p?.addressRu)}</p>
                  ) : null}
                  {p?.phone ? (
                    <p className="mt-1 text-sm">
                      <a href={`tel:${p.phone.replace(/\s/g, '')}`} className="font-semibold text-brand">{p.phone}</a>
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {p?.langKk ? <span className="badge bg-brand-soft text-brand-ink">Қазақша</span> : null}
                    {p?.langRu ? <span className="badge bg-brand-soft text-brand-ink">Русский</span> : null}
                    {p?.placesFree ? (
                      <span className="badge bg-emerald-100 text-emerald-800">{T.freePlaces[locale].replace('%s', String(p.placesFree))}</span>
                    ) : null}
                  </div>
                  <a href={`https://${host}`} className="btn-secondary mt-4 self-start text-sm">
                    {T.openSite[locale]}
                  </a>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
      </div>
    </PortalPage>
  );
}
