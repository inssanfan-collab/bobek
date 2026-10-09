import type { Metadata } from 'next';
import { prisma } from '@/server/db';
import { searchTenantIds } from '@/server/db/search';
import { env } from '@/lib/env';
import { CatalogMap } from '@/components/portal/CatalogMap';
import { SalesPage } from '@/components/portal/sales/SalesChrome';
import { localeFromParam, pick } from '@/lib/i18n';
import { KIND } from '@/lib/labels';
import type { Prisma } from '@prisma/client';
import { portalAlternates } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const locale = localeFromParam((await searchParams).lang);
  return {
    alternates: portalAlternates('/catalog', locale),
    title: locale === 'kk' ? 'Балабақшалар каталогы' : 'Каталог детских садов',
    description: locale === 'kk' ? 'Балабақшалар мен шағын орталықтар: мекенжайлары, телефондары, оқыту тілі, бос орындар және ресми сайттарға сілтемелер.' : 'Детские сады и мини-центры: адреса, телефоны, язык обучения, свободные места и ссылки на официальные сайты.',
  };
}

const T = {
  title: { kk: 'Балабақшалар каталогы', ru: 'Каталог детских садов' },
  lead: {
    kk: 'EduSad-тағы балабақшалардың ресми сайттары: мекенжайы, телефоны, оқыту тілі және бос орындар.',
    ru: 'Официальные сайты детских садов на EduSad: адрес, телефон, язык обучения и свободные места.',
  },
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
    isDemo: false,
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
      where: { district: { not: null }, tenant: { status: 'ACTIVE', isDemo: false } },
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
    <SalesPage locale={locale} pathname="/catalog" title={T.title[locale]} lead={T.lead[locale]}>
      <form className="ct-search" role="search">
        <div>
          <label htmlFor="q">{T.searchLabel[locale]}</label>
          <input id="q" name="q" defaultValue={query} placeholder={T.searchExample[locale]} />
        </div>
        <div>
          <label htmlFor="district">{T.district[locale]}</label>
          <select id="district" name="district" defaultValue={params.district ?? ''}>
            <option value="">{T.allDistricts[locale]}</option>
            {districts.map((d) => (
              <option key={d.district} value={d.district ?? ''}>{d.district}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="kind">{T.kind[locale]}</label>
          <select id="kind" name="kind" defaultValue={params.kind ?? ''}>
            <option value="">{T.anyKind[locale]}</option>
            {Object.entries(KIND).map(([value, phrase]) => (
              <option key={value} value={value}>{phrase[locale]}</option>
            ))}
          </select>
        </div>
        <div className="ct-search-go">
          <label className="ct-check">
            <input type="checkbox" name="free" value="1" defaultChecked={params.free === '1'} />
            {T.hasPlaces[locale]}
          </label>
          {locale === 'kk' ? <input type="hidden" name="lang" value="kk" /> : null}
          <button type="submit" className="sbtn sbtn-primary">{T.find[locale]}</button>
        </div>
      </form>

      <div className="ct-map">
        <CatalogMap gardens={mapGardens} />
      </div>

      {gardens.length === 0 ? (
        <div className="ct-empty">
          <h2>{T.nothing[locale]}</h2>
          <p>{T.nothingHint[locale]}</p>
        </div>
      ) : (
        <>
          <p className="note">{T.found[locale].replace('%s', String(gardens.length))}</p>
          <div className="ct-grid">
            {gardens.map((tenant) => {
              const p = tenant.profile;
              const host = siteHost(tenant);
              const number = numbers.get(tenant.id);
              const address = pick(locale, p?.addressKk, p?.addressRu);
              return (
                <article key={tenant.id} className="ct-card">
                  {p?.coverMediaId ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/api/media/${p.coverMediaId}`} alt="" loading="lazy" className="ct-cover" />
                  ) : null}
                  <div className="ct-body">
                    <div className="ct-head">
                      <h2>
                        {number ? <span className="ct-num" title={T.markTitle[locale]}>{number}</span> : null}
                        {pick(locale, p?.nameKk, p?.nameRu) || tenant.slug}
                      </h2>
                      <span className={p?.isPrivate ? 'ct-badge ct-private' : 'ct-badge'}>
                        {p?.isPrivate ? T.private[locale] : T.state[locale]}
                      </span>
                    </div>
                    {p?.kind ? <p className="ct-kind">{KIND[p.kind][locale]}</p> : null}
                    {address ? <p>{address}</p> : null}
                    {p?.phone ? (
                      <p><a href={`tel:${p.phone.replace(/\s/g, '')}`} className="ct-phone">{p.phone}</a></p>
                    ) : null}
                    <div className="ct-tags">
                      {p?.langKk ? <span className="ct-badge">Қазақша</span> : null}
                      {p?.langRu ? <span className="ct-badge">Русский</span> : null}
                      {p?.placesFree ? (
                        <span className="ct-badge ct-free">{T.freePlaces[locale].replace('%s', String(p.placesFree))}</span>
                      ) : null}
                    </div>
                    <a href={`https://${host}`} className="sbtn sbtn-secondary">{T.openSite[locale]}</a>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </SalesPage>
  );
}
