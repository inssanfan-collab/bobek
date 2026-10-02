import { prisma } from '@/server/db';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { pick } from '@/lib/i18n';
import { deletePricePlan, savePricePlan } from '../actions';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Бағалар', ru: 'Стоимость' },
  lead: {
    kk: 'Жеке балабақшаның тарифтері: толық күн, жарты күн және т.б. Ата-аналар бағаны сайттан көреді — қоңырау азаяды.',
    ru: 'Тарифы частного сада: полный день, полдня и т.п. Родители видят цену на сайте — звонков меньше.',
  },
  addHeading: { kk: 'Тариф қосу', ru: 'Добавить тариф' },
  name: { kk: 'Атауы', ru: 'Название' },
  price: { kk: 'Бағасы, ₸', ru: 'Цена, ₸' },
  period: { kk: 'Кезең', ru: 'Период' },
  periodHintKk: { kk: 'айына', ru: 'айына' },
  periodHintRu: { kk: 'в месяц', ru: 'в месяц' },
  features: { kk: 'Не кіреді — әр жолға біреуден', ru: 'Что входит — по пункту на строку' },
  featured: { kk: '«Көп таңдалады» деп белгілеу', ru: 'Отметить «Чаще выбирают»' },
  add: { kk: 'Қосу', ru: 'Добавить' },
  empty: { kk: 'Әзірге тариф жоқ', ru: 'Тарифов пока нет' },
  remove: { kk: 'Жою', ru: 'Удалить' },
  inRu: { kk: '(орыс.)', ru: '(рус.)' },
  inKk: { kk: '(қаз.)', ru: '(каз.)' },
} as const;

export default async function PricesPage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);
  const locale = ctx.user.locale;

  const [items, csrf] = await Promise.all([
    prisma.pricePlan.findMany({ where: { tenantId: ctx.tenantId }, orderBy: { position: 'asc' } }),
    csrfToken(),
  ]);

  return (
    <>
      <PageHeader title={T.title[locale]} description={T.lead[locale]} />

      {ctx.canEdit ? (
        <form action={savePricePlan} className="card mb-6 grid gap-4 p-6 sm:grid-cols-2">
          <input type="hidden" name={CSRF_FIELD} value={csrf} />
          <input type="hidden" name="host" value={host} />
          <h2 className="font-display text-lg font-bold sm:col-span-2">{T.addHeading[locale]}</h2>
          <div>
            <label className="field-label" htmlFor="nameKk">{T.name[locale]} {T.inKk[locale]}</label>
            <input id="nameKk" name="nameKk" className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="nameRu">{T.name[locale]} {T.inRu[locale]}</label>
            <input id="nameRu" name="nameRu" className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="priceKzt">{T.price[locale]} *</label>
            <input id="priceKzt" name="priceKzt" required inputMode="numeric" className="field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label" htmlFor="periodKk">{T.period[locale]} {T.inKk[locale]}</label>
              <input id="periodKk" name="periodKk" placeholder={T.periodHintKk[locale]} className="field" />
            </div>
            <div>
              <label className="field-label" htmlFor="periodRu">{T.period[locale]} {T.inRu[locale]}</label>
              <input id="periodRu" name="periodRu" placeholder={T.periodHintRu[locale]} className="field" />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="featuresKk">{T.features[locale]} {T.inKk[locale]}</label>
            <textarea id="featuresKk" name="featuresKk" rows={4} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="featuresRu">{T.features[locale]} {T.inRu[locale]}</label>
            <textarea id="featuresRu" name="featuresRu" rows={4} className="field" />
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" name="isFeatured" /> {T.featured[locale]}
          </label>
          <div className="sm:col-span-2">
            <SubmitButton>{T.add[locale]}</SubmitButton>
          </div>
        </form>
      ) : null}

      {items.length === 0 ? (
        <EmptyState icon="💳" title={T.empty[locale]} />
      ) : (
        <div className="card divide-y divide-line">
          {items.map((item) => (
            <div key={item.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
              <p className="font-semibold">
                {pick(locale, item.nameKk, item.nameRu)} — {item.priceKzt.toLocaleString('ru-RU')} ₸
                {pick(locale, item.periodKk, item.periodRu) ? <span className="font-normal text-muted"> / {pick(locale, item.periodKk, item.periodRu)}</span> : null}
                {item.isFeatured ? <span className="badge ml-2 bg-brand-soft text-brand-ink">★</span> : null}
              </p>
              {ctx.canEdit ? (
                <form action={deletePricePlan}>
                  <input type="hidden" name={CSRF_FIELD} value={csrf} />
                  <input type="hidden" name="host" value={host} />
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" className="btn-ghost px-3 py-1 text-xs text-red-600">{T.remove[locale]}</button>
                </form>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
