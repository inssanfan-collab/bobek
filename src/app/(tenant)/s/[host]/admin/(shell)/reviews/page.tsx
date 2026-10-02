import { prisma } from '@/server/db';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { pick } from '@/lib/i18n';
import { deleteReview, saveReview } from '../actions';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Ата-аналар пікірлері', ru: 'Отзывы родителей' },
  lead: {
    kk: 'Тек шынайы пікірлер және авторының келісімімен. Ойдан шығарылған пікір ата-аналарды алдау болып табылады.',
    ru: 'Только настоящие отзывы и с согласия автора. Придуманный отзыв — это обман родителей.',
  },
  addHeading: { kk: 'Пікір қосу', ru: 'Добавить отзыв' },
  author: { kk: 'Авторы', ru: 'Автор' },
  authorHint: { kk: 'Мысалы: Айгерім Сейтқали', ru: 'Например: Айгерим Сейткали' },
  note: { kk: 'Кім', ru: 'Кто это' },
  noteHintKk: { kk: 'Айлиннің анасы', ru: 'Айлиннің анасы' },
  noteHintRu: { kk: 'мама Айлин', ru: 'мама Айлин' },
  text: { kk: 'Пікір мәтіні', ru: 'Текст отзыва' },
  textHint: {
    kk: 'Пікір қай тілде жазылса, сол тілде қалдырыңыз — екінші өрісті бос қалдыруға болады.',
    ru: 'Оставьте отзыв на том языке, на котором его написали, — второе поле можно не заполнять.',
  },
  rating: { kk: 'Бағасы', ru: 'Оценка' },
  noRating: { kk: 'Бағасыз', ru: 'Без оценки' },
  add: { kk: 'Қосу', ru: 'Добавить' },
  empty: { kk: 'Әзірге пікір жоқ', ru: 'Отзывов пока нет' },
  remove: { kk: 'Жою', ru: 'Удалить' },
  inRu: { kk: '(орыс.)', ru: '(рус.)' },
  inKk: { kk: '(қаз.)', ru: '(каз.)' },
} as const;

export default async function ReviewsPage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);
  const locale = ctx.user.locale;

  const [items, csrf] = await Promise.all([
    prisma.review.findMany({ where: { tenantId: ctx.tenantId }, orderBy: { position: 'asc' } }),
    csrfToken(),
  ]);

  return (
    <>
      <PageHeader title={T.title[locale]} description={T.lead[locale]} />

      {ctx.canEdit ? (
        <form action={saveReview} className="card mb-6 grid gap-4 p-6 sm:grid-cols-2">
          <input type="hidden" name={CSRF_FIELD} value={csrf} />
          <input type="hidden" name="host" value={host} />
          <h2 className="font-display text-lg font-bold sm:col-span-2">{T.addHeading[locale]}</h2>
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="authorName">{T.author[locale]} *</label>
            <input id="authorName" name="authorName" required minLength={2} placeholder={T.authorHint[locale]} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="authorNoteKk">{T.note[locale]} {T.inKk[locale]}</label>
            <input id="authorNoteKk" name="authorNoteKk" placeholder={T.noteHintKk[locale]} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="authorNoteRu">{T.note[locale]} {T.inRu[locale]}</label>
            <input id="authorNoteRu" name="authorNoteRu" placeholder={T.noteHintRu[locale]} className="field" />
          </div>
          <p className="text-sm text-muted sm:col-span-2">{T.textHint[locale]}</p>
          <div>
            <label className="field-label" htmlFor="textKk">{T.text[locale]} {T.inKk[locale]}</label>
            <textarea id="textKk" name="textKk" rows={4} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="textRu">{T.text[locale]} {T.inRu[locale]}</label>
            <textarea id="textRu" name="textRu" rows={4} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="rating">{T.rating[locale]}</label>
            <select id="rating" name="rating" className="field" defaultValue="">
              <option value="">{T.noRating[locale]}</option>
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>{'★'.repeat(value)}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <SubmitButton>{T.add[locale]}</SubmitButton>
          </div>
        </form>
      ) : null}

      {items.length === 0 ? (
        <EmptyState icon="💬" title={T.empty[locale]} />
      ) : (
        <div className="card divide-y divide-line">
          {items.map((item) => (
            <div key={item.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="font-semibold">
                  {item.authorName}
                  {pick(locale, item.authorNoteKk, item.authorNoteRu) ? (
                    <span className="font-normal text-muted"> · {pick(locale, item.authorNoteKk, item.authorNoteRu)}</span>
                  ) : null}
                  {item.rating ? <span className="ml-2 text-amber-600">{'★'.repeat(item.rating)}</span> : null}
                </p>
                {ctx.canEdit ? (
                  <form action={deleteReview}>
                    <input type="hidden" name={CSRF_FIELD} value={csrf} />
                    <input type="hidden" name="host" value={host} />
                    <input type="hidden" name="id" value={item.id} />
                    <button type="submit" className="btn-ghost px-3 py-1 text-xs text-red-600">{T.remove[locale]}</button>
                  </form>
                ) : null}
              </div>
              <p className="mt-1 whitespace-pre-line text-sm text-muted">{pick(locale, item.textKk, item.textRu)}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
