import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { FEEDBACK_STATUS, formatDateTime } from '@/lib/labels';
import { answerFeedback } from '../actions';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Ата-аналардың өтініштері', ru: 'Обращения родителей' },
  lead: {
    kk: 'Виртуалды қабылдаудан келген хабарламалар. Жауапты тек сіз көресіз — көрсетілген байланыс арқылы хабарласыңыз.',
    ru: 'Сообщения из виртуальной приёмной. Ответ виден только вам — свяжитесь с родителем по указанному контакту.',
  },
  empty: { kk: 'Әзірге өтініштер жоқ', ru: 'Обращений пока нет' },
  answerNote: { kk: 'Жауап туралы белгі', ru: 'Заметка об ответе' },
  answerExample: {
    kk: '12 наурызда телефон соқтым, мәселе шешілді',
    ru: 'Позвонила 12 марта, вопрос решён',
  },
  save: { kk: 'Сақтау', ru: 'Сохранить' },
} as const;

export default async function FeedbackPage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);
  const locale = ctx.user.locale;

  const [messages, csrf] = await Promise.all([
    ctx.db.feedback.findMany({ orderBy: [{ status: 'asc' }, { createdAt: 'desc' }], take: 200 }),
    csrfToken(),
  ]);

  return (
    <>
      <PageHeader
        title={T.title[locale]}
        description={T.lead[locale]}
      />

      {messages.length === 0 ? (
        <EmptyState icon="✉️" title={T.empty[locale]} />
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
                    {FEEDBACK_STATUS[message.status][locale]}
                  </span>
                  <p className="mt-1 text-sm text-muted">{formatDateTime(message.createdAt, locale)}</p>
                </div>
              </div>

              <p className="mt-3 whitespace-pre-line">{message.message}</p>

              {ctx.canEdit ? (
                <form action={answerFeedback} className="mt-4 border-t border-line pt-4">
                  <input type="hidden" name={CSRF_FIELD} value={csrf} />
                  <input type="hidden" name="host" value={host} />
                  <input type="hidden" name="id" value={message.id} />
                  <label className="field-label" htmlFor={`answer-${message.id}`}>{T.answerNote[locale]}</label>
                  <textarea
                    id={`answer-${message.id}`}
                    name="answer"
                    rows={2}
                    defaultValue={message.answer ?? ''}
                    className="field"
                    placeholder={T.answerExample[locale]}
                  />
                  <div className="mt-3">
                    <SubmitButton className="btn-secondary text-sm">{T.save[locale]}</SubmitButton>
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
