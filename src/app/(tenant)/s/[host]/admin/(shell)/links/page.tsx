import { prisma } from '@/server/db';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { FileInput } from '@/components/admin/FileInput';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { SortableList, SortHandle } from '@/components/admin/SortableList';
import { CATALOG_BY_KEY, USEFUL_CATALOG, USEFUL_GROUPS, isUsefulPlace } from '@/lib/useful-links';
import { addUsefulLink, deleteUsefulLink, saveUsefulLinks } from '../actions';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Пайдалы сілтемелер', ru: 'Полезные ссылки' },
  lead: {
    kk: 'Сайттың төменгі жағындағы мемлекеттік ресурстар тақтайшалары: министрлік, eGov, сенім телефондары, сыбайлас жемқорлыққа қарсы іс-қимыл. Мекенжайлар мен нөмірлерді біз жүргіземіз — мемлекеттік сайт мекенжайын өзгертсе, тақтайша өзі жаңарады.',
    ru: 'Плитки государственных ресурсов внизу сайта: министерство, eGov, телефоны доверия, противодействие коррупции. Адреса и номера ведём мы — если госсайт сменит адрес, плитка обновится сама.',
  },
  choose: { kk: 'Тақтайшаларды таңдаңыз', ru: 'Выберите плитки' },
  regionUrl: { kk: 'Білім басқармасы сайтының мекенжайы', ru: 'Адрес сайта управления образования' },
  regionUrlHint: {
    kk: 'Мысалы, https://www.gov.kz/memleket/entities/... — тек .kz доменіндегі сайттар',
    ru: 'Например, https://www.gov.kz/memleket/entities/... — только сайты на домене .kz',
  },
  regionTitle: { kk: 'Тақтайшадағы атауы (міндетті емес)', ru: 'Название на плитке (необязательно)' },
  regionTitlePlaceholder: { kk: 'Ақтөбе облысының білім басқармасы', ru: 'Управление образования Актюбинской области' },
  place: { kk: 'Қай жерде көрсету', ru: 'Где показывать' },
  placeHome: { kk: 'Тек басты бетте', ru: 'Только на главной' },
  placeAll: { kk: 'Барлық беттерде, төменгі бөліктің алдында', ru: 'На всех страницах, перед подвалом' },
  anticorruptionNote: {
    kk: '«Сыбайлас жемқорлыққа қарсы іс-қимыл» бетінде осы бағыттың тақтайшалары әрқашан көрсетіледі.',
    ru: 'На странице «Противодействие коррупции» плитки этой группы показываются всегда.',
  },
  save: { kk: 'Сақтау', ru: 'Сохранить' },
  customTitle: { kk: 'Өз баннеріңіз', ru: 'Свой баннер' },
  customLead: {
    kk: 'Тізімде жоқ сілтеме: аудан әкімдігі, қалалық акция, серіктес ұйым.',
    ru: 'Ссылка, которой нет в списке: акимат района, городская акция, организация-партнёр.',
  },
  name: { kk: 'Атауы', ru: 'Название' },
  note: { kk: 'Қысқаша сипаттама', ru: 'Короткое описание' },
  url: { kk: 'Сілтеме', ru: 'Ссылка' },
  image: { kk: 'Сурет (міндетті емес)', ru: 'Картинка (необязательно)' },
  add: { kk: 'Қосу', ru: 'Добавить' },
  current: { kk: 'Сайттағы тақтайшалар', ru: 'Плитки на сайте' },
  empty: { kk: 'Әзірге тақтайша таңдалмаған', ru: 'Плитки пока не выбраны' },
  remove: { kk: 'Жою', ru: 'Удалить' },
  own: { kk: 'өз баннері', ru: 'свой баннер' },
  noUrl: { kk: 'мекенжайы көрсетілмеген — сайтта көрінбейді', ru: 'адрес не указан — на сайте не видна' },
  inRu: { kk: '(орыс.)', ru: '(рус.)' },
  inKk: { kk: '(қаз.)', ru: '(каз.)' },
} as const;

export default async function UsefulLinksPage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);
  const locale = ctx.user.locale;

  const [rows, tenant, csrf] = await Promise.all([
    prisma.usefulLink.findMany({ where: { tenantId: ctx.tenantId }, orderBy: { position: 'asc' } }),
    prisma.tenant.findUnique({ where: { id: ctx.tenantId }, select: { usefulLinksPlace: true } }),
    csrfToken(),
  ]);
  const chosen = new Set(rows.map((row) => row.catalogKey));
  const region = rows.find((row) => row.catalogKey === 'region');
  const place = isUsefulPlace(tenant?.usefulLinksPlace) ? tenant.usefulLinksPlace : 'home';
  const hidden = (
    <>
      <input type="hidden" name={CSRF_FIELD} value={csrf} />
      <input type="hidden" name="host" value={host} />
    </>
  );

  return (
    <>
      <PageHeader title={T.title[locale]} description={T.lead[locale]} />

      {ctx.canEdit ? (
        <form action={saveUsefulLinks} className="card mb-6 space-y-6 p-6">
          {hidden}
          <h2 className="font-display text-lg font-bold">{T.choose[locale]}</h2>
          {USEFUL_GROUPS.map(({ group, title }) => (
            <fieldset key={group} className="space-y-2">
              <legend className="mb-2 text-sm font-semibold text-muted">{title[locale]}</legend>
              {USEFUL_CATALOG.filter((item) => item.group === group).map((item) => (
                <label key={item.key} className="flex items-start gap-3 rounded-xl border border-line p-3 hover:border-brand">
                  <input type="checkbox" name="catalog" value={item.key} defaultChecked={chosen.has(item.key)} className="mt-1" />
                  <span>
                    <span className="block font-semibold">{item.title[locale]}</span>
                    <span className="block text-sm text-muted">{item.note[locale]}</span>
                  </span>
                </label>
              ))}
              {group === 'region' ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="field-label" htmlFor="regionUrl">{T.regionUrl[locale]}</label>
                    <input id="regionUrl" name="regionUrl" type="url" defaultValue={region?.url ?? ''} className="field" placeholder="https://" />
                    <p className="mt-1 text-xs text-muted">{T.regionUrlHint[locale]}</p>
                  </div>
                  <div>
                    <label className="field-label" htmlFor="regionTitleRu">{T.regionTitle[locale]} {T.inRu[locale]}</label>
                    <input id="regionTitleRu" name="regionTitleRu" defaultValue={region?.titleRu ?? ''} className="field" placeholder={T.regionTitlePlaceholder.ru} />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="regionTitleKk">{T.regionTitle[locale]} {T.inKk[locale]}</label>
                    <input id="regionTitleKk" name="regionTitleKk" defaultValue={region?.titleKk ?? ''} className="field" placeholder={T.regionTitlePlaceholder.kk} />
                  </div>
                </div>
              ) : null}
              {group === 'anticorruption' ? <p className="text-xs text-muted">{T.anticorruptionNote[locale]}</p> : null}
            </fieldset>
          ))}

          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-semibold text-muted">{T.place[locale]}</legend>
            <label className="flex items-center gap-3">
              <input type="radio" name="place" value="home" defaultChecked={place === 'home'} />
              {T.placeHome[locale]}
            </label>
            <label className="flex items-center gap-3">
              <input type="radio" name="place" value="all" defaultChecked={place === 'all'} />
              {T.placeAll[locale]}
            </label>
          </fieldset>

          <SubmitButton>{T.save[locale]}</SubmitButton>
        </form>
      ) : null}

      {ctx.canEdit ? (
        <form action={addUsefulLink} className="card mb-6 grid gap-4 p-6 sm:grid-cols-2">
          {hidden}
          <div className="sm:col-span-2">
            <h2 className="font-display text-lg font-bold">{T.customTitle[locale]}</h2>
            <p className="mt-1 text-sm text-muted">{T.customLead[locale]}</p>
          </div>
          <div>
            <label className="field-label" htmlFor="titleRu">{T.name[locale]} {T.inRu[locale]} *</label>
            <input id="titleRu" name="titleRu" required className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="titleKk">{T.name[locale]} {T.inKk[locale]}</label>
            <input id="titleKk" name="titleKk" className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="noteRu">{T.note[locale]} {T.inRu[locale]}</label>
            <input id="noteRu" name="noteRu" className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="noteKk">{T.note[locale]} {T.inKk[locale]}</label>
            <input id="noteKk" name="noteKk" className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="url">{T.url[locale]} *</label>
            <input id="url" name="url" type="url" required className="field" placeholder="https://" />
          </div>
          <div>
            <label className="field-label" htmlFor="image">{T.image[locale]}</label>
            <FileInput id="image" name="image" accept="image/*" locale={locale} />
          </div>
          <div className="sm:col-span-2">
            <SubmitButton>{T.add[locale]}</SubmitButton>
          </div>
        </form>
      ) : null}

      <h2 className="mb-3 font-display text-lg font-bold">{T.current[locale]}</h2>
      {rows.length === 0 ? (
        <EmptyState icon="🔗" title={T.empty[locale]} />
      ) : (
        <SortableList
          kind="links"
          host={host}
          csrf={csrf}
          locale={locale}
          layout="list"
          disabled={!ctx.canEdit}
          className="card divide-y divide-line overflow-hidden"
          items={rows.map((row) => {
            const item = row.catalogKey ? CATALOG_BY_KEY.get(row.catalogKey) : undefined;
            const title = (locale === 'kk' ? row.titleKk || row.titleRu : row.titleRu || row.titleKk) || item?.title[locale] || '—';
            const target = item ? (item.href ? item.href[locale] : row.url) : row.url;
            return {
              id: row.id,
              content: (
                <div className="flex flex-wrap items-center justify-between gap-3 bg-card px-5 py-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <SortHandle className="-my-1.5 -ml-2 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {title}
                        {item ? null : <span className="ml-2 text-xs font-normal text-muted">· {T.own[locale]}</span>}
                      </p>
                      <p className="truncate text-xs text-muted">{target || T.noUrl[locale]}</p>
                    </div>
                  </div>
                  {ctx.canEdit ? (
                    <form action={deleteUsefulLink}>
                      {hidden}
                      <input type="hidden" name="id" value={row.id} />
                      <DeleteButton className="btn-ghost px-3 py-1 text-xs text-red-600">{T.remove[locale]}</DeleteButton>
                    </form>
                  ) : null}
                </div>
              ),
            };
          })}
        />
      )}
    </>
  );
}
