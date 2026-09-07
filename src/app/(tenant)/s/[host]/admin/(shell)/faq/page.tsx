import { prisma } from '@/server/db';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { deleteFaq, saveFaq } from '../actions';

export const dynamic = 'force-dynamic';

const SUGGESTIONS = [
  'Во сколько нужно привести ребёнка?',
  'Что взять с собой в первый день?',
  'Как оплачивать питание?',
  'Что делать, если ребёнок заболел?',
  'Можно ли забрать ребёнка раньше?',
];

export default async function FaqPage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);

  const [items, csrf] = await Promise.all([
    prisma.faqItem.findMany({ where: { tenantId: ctx.tenantId }, orderBy: { position: 'asc' } }),
    csrfToken(),
  ]);

  return (
    <>
      <PageHeader
        title="Частые вопросы"
        description="Каждый ответ здесь — это несколько звонков, которых не будет у заведующей."
      />

      {ctx.canEdit ? (
        <form action={saveFaq} className="card mb-6 grid gap-4 p-6 sm:grid-cols-2">
          <input type="hidden" name={CSRF_FIELD} value={csrf} />
          <input type="hidden" name="host" value={host} />
          <div className="sm:col-span-2">
            <h2 className="font-display text-lg font-bold">Добавить вопрос</h2>
            <p className="mt-1 text-sm text-muted">
              О чём чаще всего спрашивают: {SUGGESTIONS.join(' · ')}
            </p>
          </div>
          <div>
            <label className="field-label" htmlFor="questionRu">Вопрос (рус.) *</label>
            <input id="questionRu" name="questionRu" required className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="questionKk">Сұрақ (қаз.)</label>
            <input id="questionKk" name="questionKk" className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="answerRu">Ответ (рус.)</label>
            <textarea id="answerRu" name="answerRu" rows={3} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="answerKk">Жауап (қаз.)</label>
            <textarea id="answerKk" name="answerKk" rows={3} className="field" />
          </div>
          <div className="sm:col-span-2">
            <SubmitButton>Добавить</SubmitButton>
          </div>
        </form>
      ) : null}

      {items.length === 0 ? (
        <EmptyState icon="❓" title="Вопросов пока нет" />
      ) : (
        <div className="card divide-y divide-line">
          {items.map((item) => (
            <div key={item.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="font-semibold">{item.questionRu}</p>
                {ctx.canEdit ? (
                  <form action={deleteFaq}>
                    <input type="hidden" name={CSRF_FIELD} value={csrf} />
                    <input type="hidden" name="host" value={host} />
                    <input type="hidden" name="id" value={item.id} />
                    <button type="submit" className="btn-ghost px-3 py-1 text-xs text-red-600">Удалить</button>
                  </form>
                ) : null}
              </div>
              {item.answerRu ? <p className="mt-1 text-sm text-muted">{item.answerRu}</p> : null}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
