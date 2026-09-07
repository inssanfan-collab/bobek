import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { formatDate } from '@/lib/labels';
import { deleteMenuDay, saveMenuDay } from '../actions';

export const dynamic = 'force-dynamic';

export default async function MenuPage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);

  const [days, csrf] = await Promise.all([
    ctx.db.menuDays.findMany({ orderBy: { date: 'desc' }, take: 30 }),
    csrfToken(),
  ]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <PageHeader
        title="Меню питания"
        description="Заполняйте по дням или загрузите скан утверждённого меню — родители спрашивают об этом чаще всего."
      />

      {ctx.canEdit ? (
        <form action={saveMenuDay} className="card mb-6 grid gap-4 p-6 sm:grid-cols-2">
          <input type="hidden" name={CSRF_FIELD} value={csrf} />
          <input type="hidden" name="host" value={host} />
          <div className="sm:col-span-2">
            <h2 className="font-display text-lg font-bold">Меню на день</h2>
            <p className="mt-1 text-sm text-muted">Если меню на эту дату уже есть, оно будет обновлено.</p>
          </div>
          <div>
            <label className="field-label" htmlFor="date">Дата *</label>
            <input id="date" name="date" type="date" required defaultValue={today} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="scan">Скан утверждённого меню</label>
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
          <div className="sm:col-span-2">
            <SubmitButton>Сохранить меню</SubmitButton>
          </div>
        </form>
      ) : null}

      {days.length === 0 ? (
        <EmptyState icon="🍎" title="Меню пока не заполнено" />
      ) : (
        <div className="card divide-y divide-line">
          {days.map((day) => (
            <div key={day.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
              <span className="w-40 font-semibold">{formatDate(day.date)}</span>
              <span className="min-w-0 flex-1 truncate text-sm text-muted">
                {[day.breakfastRu, day.lunchRu, day.snackRu].filter(Boolean).join(' · ') || 'только скан'}
              </span>
              {day.scanMediaId ? (
                <a href={`/api/media/${day.scanMediaId}`} target="_blank" rel="noreferrer" className="btn-ghost text-xs">
                  Скан
                </a>
              ) : null}
              {ctx.canEdit ? (
                <form action={deleteMenuDay}>
                  <input type="hidden" name={CSRF_FIELD} value={csrf} />
                  <input type="hidden" name="host" value={host} />
                  <input type="hidden" name="id" value={day.id} />
                  <button type="submit" className="btn-ghost px-3 py-1 text-xs text-red-600">Удалить</button>
                </form>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
