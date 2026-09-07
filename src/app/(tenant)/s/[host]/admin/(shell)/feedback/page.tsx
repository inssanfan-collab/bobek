import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { FEEDBACK_STATUS_LABEL, formatDateTime } from '@/lib/labels';
import { answerFeedback } from '../actions';

export const dynamic = 'force-dynamic';

export default async function FeedbackPage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);

  const [messages, csrf] = await Promise.all([
    ctx.db.feedback.findMany({ orderBy: [{ status: 'asc' }, { createdAt: 'desc' }], take: 200 }),
    csrfToken(),
  ]);

  return (
    <>
      <PageHeader
        title="Обращения родителей"
        description="Сообщения из виртуальной приёмной. Ответ виден только вам — свяжитесь с родителем по указанному контакту."
      />

      {messages.length === 0 ? (
        <EmptyState icon="✉️" title="Обращений пока нет" />
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <article key={message.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-bold">{message.name}</p>
                  <p className="text-sm text-muted">{message.contact}</p>
                </div>
                <div className="text-right">
                  <span className={`badge ${message.status === 'NEW' ? 'bg-amber-100 text-amber-800' : message.status === 'ANSWERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-brand-soft text-brand-ink'}`}>
                    {FEEDBACK_STATUS_LABEL[message.status]}
                  </span>
                  <p className="mt-1 text-sm text-muted">{formatDateTime(message.createdAt)}</p>
                </div>
              </div>

              <p className="mt-3 whitespace-pre-line">{message.message}</p>

              {ctx.canEdit ? (
                <form action={answerFeedback} className="mt-4 border-t border-line pt-4">
                  <input type="hidden" name={CSRF_FIELD} value={csrf} />
                  <input type="hidden" name="host" value={host} />
                  <input type="hidden" name="id" value={message.id} />
                  <label className="field-label" htmlFor={`answer-${message.id}`}>Заметка об ответе</label>
                  <textarea
                    id={`answer-${message.id}`}
                    name="answer"
                    rows={2}
                    defaultValue={message.answer ?? ''}
                    className="field"
                    placeholder="Позвонила 12 марта, вопрос решён"
                  />
                  <div className="mt-3">
                    <SubmitButton className="btn-secondary text-sm">Сохранить</SubmitButton>
                  </div>
                </form>
              ) : message.answer ? (
                <p className="mt-3 border-t border-line pt-3 text-sm text-muted">{message.answer}</p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
