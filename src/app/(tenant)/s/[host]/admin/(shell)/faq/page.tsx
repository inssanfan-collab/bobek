import { prisma } from '@/server/db';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { pick } from '@/lib/i18n';
import { deleteFaq, saveFaq } from '../actions';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Жиі қойылатын сұрақтар', ru: 'Частые вопросы' },
  lead: {
    kk: 'Мұндағы әр жауап — меңгерушіге түспейтін бірнеше қоңырау.',
    ru: 'Каждый ответ здесь — это несколько звонков, которых не будет у заведующей.',
  },
  addHeading: { kk: 'Сұрақ қосу', ru: 'Добавить вопрос' },
  suggestionsLead: { kk: 'Жиі сұрайтындары:', ru: 'О чём чаще всего спрашивают:' },
  question: { kk: 'Сұрақ', ru: 'Вопрос' },
  answer: { kk: 'Жауап', ru: 'Ответ' },
  add: { kk: 'Қосу', ru: 'Добавить' },
  empty: { kk: 'Әзірге сұрақтар жоқ', ru: 'Вопросов пока нет' },
  remove: { kk: 'Жою', ru: 'Удалить' },
  inRu: { kk: '(орыс.)', ru: '(рус.)' },
  inKk: { kk: '(қаз.)', ru: '(каз.)' },
} as const;

const SUGGESTIONS = {
  kk: [
    'Баланы сағат нешеде әкелу керек?',
    'Алғашқы күні не алып келу керек?',
    'Тамақтану ақысын қалай төлейді?',
    'Бала ауырып қалса не істеу керек?',
    'Баланы ертерек алып кетуге бола ма?',
  ],
  ru: [
    'Во сколько нужно привести ребёнка?',
    'Что взять с собой в первый день?',
    'Как оплачивать питание?',
    'Что делать, если ребёнок заболел?',
    'Можно ли забрать ребёнка раньше?',
  ],
} as const;

export default async function FaqPage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);
  const locale = ctx.user.locale;

  const [items, csrf] = await Promise.all([
    prisma.faqItem.findMany({ where: { tenantId: ctx.tenantId }, orderBy: { position: 'asc' } }),
    csrfToken(),
  ]);

  return (
    <>
      <PageHeader
        title={T.title[locale]}
        description={T.lead[locale]}
      />

      {ctx.canEdit ? (
        <form action={saveFaq} className="card mb-6 grid gap-4 p-6 sm:grid-cols-2">
          <input type="hidden" name={CSRF_FIELD} value={csrf} />
          <input type="hidden" name="host" value={host} />
          <div className="sm:col-span-2">
            <h2 className="font-display text-lg font-bold">{T.addHeading[locale]}</h2>
            <p className="mt-1 text-sm text-muted">
              {T.suggestionsLead[locale]} {SUGGESTIONS[locale].join(' · ')}
            </p>
          </div>
          <div>
            <label className="field-label" htmlFor="questionRu">{T.question[locale]} {T.inRu[locale]} *</label>
            <input id="questionRu" name="questionRu" required className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="questionKk">{T.question[locale]} {T.inKk[locale]}</label>
            <input id="questionKk" name="questionKk" className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="answerRu">{T.answer[locale]} {T.inRu[locale]}</label>
            <textarea id="answerRu" name="answerRu" rows={3} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="answerKk">{T.answer[locale]} {T.inKk[locale]}</label>
            <textarea id="answerKk" name="answerKk" rows={3} className="field" />
          </div>
          <div className="sm:col-span-2">
            <SubmitButton>{T.add[locale]}</SubmitButton>
          </div>
        </form>
      ) : null}

      {items.length === 0 ? (
        <EmptyState icon="❓" title={T.empty[locale]} />
      ) : (
        <div className="card divide-y divide-line">
          {items.map((item) => (
            <div key={item.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="font-semibold">{pick(locale, item.questionKk, item.questionRu)}</p>
                {ctx.canEdit ? (
                  <form action={deleteFaq}>
                    <input type="hidden" name={CSRF_FIELD} value={csrf} />
                    <input type="hidden" name="host" value={host} />
                    <input type="hidden" name="id" value={item.id} />
                    <button type="submit" className="btn-ghost px-3 py-1 text-xs text-red-600">{T.remove[locale]}</button>
                  </form>
                ) : null}
              </div>
              {pick(locale, item.answerKk, item.answerRu) ? (
                <p className="mt-1 text-sm text-muted">{pick(locale, item.answerKk, item.answerRu)}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
