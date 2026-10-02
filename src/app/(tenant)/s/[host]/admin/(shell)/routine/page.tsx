import { prisma } from '@/server/db';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { pick } from '@/lib/i18n';
import { deleteRoutineItem, saveRoutineItem } from '../actions';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Күн тәртібі (басты бетке)', ru: 'Распорядок дня (на главную)' },
  lead: {
    kk: 'Басты бетте карточкалармен көрсетілетін қысқа күн тәртібі. Топтар бойынша толық режим — «Күн тәртібі» бетінде.',
    ru: 'Короткий распорядок, который показывается на главной карточками. Подробный режим по группам — на странице «Режим дня».',
  },
  addHeading: { kk: 'Тармақ қосу', ru: 'Добавить пункт' },
  time: { kk: 'Уақыты', ru: 'Время' },
  what: { kk: 'Не болады', ru: 'Что происходит' },
  examples: { kk: 'Мысалы: 08:00–08:30 — Таңғы ас', ru: 'Например: 08:00–08:30 — Завтрак' },
  add: { kk: 'Қосу', ru: 'Добавить' },
  empty: { kk: 'Әзірге тармақ жоқ', ru: 'Пунктов пока нет' },
  remove: { kk: 'Жою', ru: 'Удалить' },
  inRu: { kk: '(орыс.)', ru: '(рус.)' },
  inKk: { kk: '(қаз.)', ru: '(каз.)' },
} as const;

export default async function RoutinePage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);
  const locale = ctx.user.locale;

  const [items, csrf] = await Promise.all([
    prisma.routineItem.findMany({ where: { tenantId: ctx.tenantId }, orderBy: { position: 'asc' } }),
    csrfToken(),
  ]);

  return (
    <>
      <PageHeader title={T.title[locale]} description={T.lead[locale]} />

      {ctx.canEdit ? (
        <form action={saveRoutineItem} className="card mb-6 grid gap-4 p-6 sm:grid-cols-3">
          <input type="hidden" name={CSRF_FIELD} value={csrf} />
          <input type="hidden" name="host" value={host} />
          <div className="sm:col-span-3">
            <h2 className="font-display text-lg font-bold">{T.addHeading[locale]}</h2>
            <p className="mt-1 text-sm text-muted">{T.examples[locale]}</p>
          </div>
          <div>
            <label className="field-label" htmlFor="time">{T.time[locale]} *</label>
            <input id="time" name="time" required placeholder="08:00–08:30" className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="titleKk">{T.what[locale]} {T.inKk[locale]}</label>
            <input id="titleKk" name="titleKk" className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="titleRu">{T.what[locale]} {T.inRu[locale]}</label>
            <input id="titleRu" name="titleRu" className="field" />
          </div>
          <div className="sm:col-span-3">
            <SubmitButton>{T.add[locale]}</SubmitButton>
          </div>
        </form>
      ) : null}

      {items.length === 0 ? (
        <EmptyState icon="🕘" title={T.empty[locale]} />
      ) : (
        <div className="card divide-y divide-line">
          {items.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
              <p>
                <span className="font-semibold tabular-nums">{item.time}</span>
                <span className="text-muted"> — {pick(locale, item.titleKk, item.titleRu)}</span>
              </p>
              {ctx.canEdit ? (
                <form action={deleteRoutineItem}>
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
