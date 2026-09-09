import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { formatDate } from '@/lib/labels';
import { pick } from '@/lib/i18n';
import { deleteMenuDay, saveMenuDay } from '../actions';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Тамақтану мәзірі', ru: 'Меню питания' },
  lead: {
    kk: 'Күн бойынша толтырыңыз немесе бекітілген мәзірдің сканын жүктеңіз — ата-аналар осыны жиі сұрайды.',
    ru: 'Заполняйте по дням или загрузите скан утверждённого меню — родители спрашивают об этом чаще всего.',
  },
  dayHeading: { kk: 'Күнгі мәзір', ru: 'Меню на день' },
  dayHint: {
    kk: 'Осы күнге мәзір бар болса, ол жаңартылады.',
    ru: 'Если меню на эту дату уже есть, оно будет обновлено.',
  },
  date: { kk: 'Күні', ru: 'Дата' },
  scan: { kk: 'Бекітілген мәзірдің сканы', ru: 'Скан утверждённого меню' },
  save: { kk: 'Мәзірді сақтау', ru: 'Сохранить меню' },
  empty: { kk: 'Мәзір әзірге толтырылмаған', ru: 'Меню пока не заполнено' },
  scanOnly: { kk: 'тек скан', ru: 'только скан' },
  scanLink: { kk: 'Скан', ru: 'Скан' },
  remove: { kk: 'Жою', ru: 'Удалить' },
} as const;

export default async function MenuPage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);
  const locale = ctx.user.locale;

  const [days, csrf] = await Promise.all([
    ctx.db.menuDays.findMany({ orderBy: { date: 'desc' }, take: 30 }),
    csrfToken(),
  ]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <PageHeader
        title={T.title[locale]}
        description={T.lead[locale]}
      />

      {ctx.canEdit ? (
        <form action={saveMenuDay} className="card mb-6 grid gap-4 p-6 sm:grid-cols-2">
          <input type="hidden" name={CSRF_FIELD} value={csrf} />
          <input type="hidden" name="host" value={host} />
          <div className="sm:col-span-2">
            <h2 className="font-display text-lg font-bold">{T.dayHeading[locale]}</h2>
            <p className="mt-1 text-sm text-muted">{T.dayHint[locale]}</p>
          </div>
          <div>
            <label className="field-label" htmlFor="date">{T.date[locale]} *</label>
            <input id="date" name="date" type="date" required defaultValue={today} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="scan">{T.scan[locale]}</label>
            <input id="scan" name="scan" type="file" accept="image/*,.pdf" className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="breakfastRu">Завтрак</label>
            <textarea id="breakfastRu" name="breakfastRu" rows={2} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="breakfastKk">Таңғы ас</label>
            <textarea id="breakfastKk" name="breakfastKk" rows={2} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="lunchRu">Обед</label>
            <textarea id="lunchRu" name="lunchRu" rows={2} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="lunchKk">Түскі ас</label>
            <textarea id="lunchKk" name="lunchKk" rows={2} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="snackRu">Полдник</label>
            <textarea id="snackRu" name="snackRu" rows={2} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="snackKk">Бесін ас</label>
            <textarea id="snackKk" name="snackKk" rows={2} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="dinnerRu">Ужин</label>
            <textarea id="dinnerRu" name="dinnerRu" rows={2} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="dinnerKk">Кешкі ас</label>
            <textarea id="dinnerKk" name="dinnerKk" rows={2} className="field" />
          </div>
          <div className="sm:col-span-2">
            <SubmitButton>{T.save[locale]}</SubmitButton>
          </div>
        </form>
      ) : null}

      {days.length === 0 ? (
        <EmptyState icon="🍎" title={T.empty[locale]} />
      ) : (
        <div className="card divide-y divide-line">
          {days.map((day) => (
            <div key={day.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
              <span className="w-40 font-semibold">{formatDate(day.date, locale)}</span>
              <span className="min-w-0 flex-1 truncate text-sm text-muted">
                {[
                  pick(locale, day.breakfastKk, day.breakfastRu),
                  pick(locale, day.lunchKk, day.lunchRu),
                  pick(locale, day.snackKk, day.snackRu),
                  pick(locale, day.dinnerKk, day.dinnerRu),
                ]
                  .filter(Boolean)
                  .join(' · ') || T.scanOnly[locale]}
              </span>
              {day.scanMediaId ? (
                <a href={`/api/media/${day.scanMediaId}`} target="_blank" rel="noreferrer" className="btn-ghost text-xs">
                  {T.scanLink[locale]}
                </a>
              ) : null}
              {ctx.canEdit ? (
                <form action={deleteMenuDay}>
                  <input type="hidden" name={CSRF_FIELD} value={csrf} />
                  <input type="hidden" name="host" value={host} />
                  <input type="hidden" name="id" value={day.id} />
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
