'use client';

import { useActionState } from 'react';
import { submitLead, type LeadState } from './actions';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Alert } from '@/components/ui/Alert';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { PLAN_CODES, PLAN_INFO, type PlanCode } from '@/lib/plans';
import { formatMoney } from '@/lib/labels';

const initial: LeadState = { ok: false };

const T = {
  sent: { kk: 'Өтінім жіберілді', ru: 'Заявка отправлена' },
  sentText: {
    kk: 'Бір жұмыс күні ішінде сізбен хабарласып, кіру деректерімен бірге сайт дайындаймыз.',
    ru: 'Мы свяжемся с вами в течение рабочего дня и подготовим сайт с доступами.',
  },
  gardenName: { kk: 'Балабақшаның атауы', ru: 'Название детского сада' },
  personName: { kk: 'Сіздің атыңыз', ru: 'Ваше имя' },
  phone: { kk: 'Телефон', ru: 'Телефон' },
  email: { kk: 'Электрондық пошта', ru: 'Электронная почта' },
  comment: { kk: 'Пікір', ru: 'Комментарий' },
  commentExample: {
    kk: 'Қоңырау шалуға ыңғайлы уақыт, сайтқа қатысты тілектер',
    ru: 'Удобное время для звонка, пожелания к сайту',
  },
  consent: {
    kk: 'Түймені басу арқылы сіз өтінім бойынша байланысу үшін көрсетілген байланыс деректерін өңдеуге келісім бересіз.',
    ru: 'Нажимая кнопку, вы соглашаетесь на обработку указанных контактных данных для связи по заявке.',
  },
  plan: { kk: 'Тариф', ru: 'Тариф' },
  planUndecided: { kk: 'Әлі шешпедім — телефонмен ақылдасайық', ru: 'Ещё не решили — обсудим по телефону' },
  perYear: { kk: 'жылына', ru: 'в год' },
  sending: { kk: 'Жіберілуде…', ru: 'Отправляем…' },
  submit: { kk: 'Өтінім жіберу', ru: 'Отправить заявку' },
} as const;

export function ApplyForm({
  csrf,
  locale = DEFAULT_LOCALE,
  plan,
  prices,
}: {
  csrf: string;
  locale?: Locale;
  plan: PlanCode | null;
  prices: Record<PlanCode, number>;
}) {
  const [state, action] = useActionState(submitLead, initial);

  if (state.ok) {
    return (
      <Alert tone="success" title={T.sent[locale]}>
        {T.sentText[locale]}
      </Alert>
    );
  }

  return (
    <form action={action} className="card space-y-4 p-6">
      <input type="hidden" name={CSRF_FIELD} value={csrf} />
      {/* Ловушка для ботов: скрыта от людей, но заполняется автоматикой. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {state.message ? <Alert tone="danger">{state.message}</Alert> : null}

      <fieldset>
        <legend className="field-label">{T.plan[locale]}</legend>
        <div className="grid gap-2">
          {PLAN_CODES.map((code) => (
            <label
              key={code}
              className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line p-3 has-[:checked]:border-brand has-[:checked]:bg-brand-soft/60"
            >
              <input type="radio" name="plan" value={code} defaultChecked={plan === code} className="mt-1 h-4 w-4" />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap justify-between gap-x-3">
                  <span className="font-semibold">{PLAN_INFO[code].name[locale]}</span>
                  <span className="font-semibold">{formatMoney(prices[code])} {T.perYear[locale]}</span>
                </span>
                <span className="block text-sm text-muted">{PLAN_INFO[code].tagline[locale]}</span>
              </span>
            </label>
          ))}
          {/* Выбор не обязателен: заведующая часто не знает, кто у них будет вести сайт. */}
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line p-3 has-[:checked]:border-brand">
            <input type="radio" name="plan" value="" defaultChecked={plan === null} className="h-4 w-4" />
            <span className="text-sm">{T.planUndecided[locale]}</span>
          </label>
        </div>
      </fieldset>

      <div>
        <label className="field-label" htmlFor="gardenName">{T.gardenName[locale]} *</label>
        <input id="gardenName" name="gardenName" required className="field" placeholder="Ясли-сад №12 «Балдырған»" />
        {state.errors?.gardenName ? <p className="field-error">{state.errors.gardenName}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="personName">{T.personName[locale]} *</label>
          <input id="personName" name="personName" required className="field" placeholder="Айгүл Сериковна" />
          {state.errors?.personName ? <p className="field-error">{state.errors.personName}</p> : null}
        </div>
        <div>
          <label className="field-label" htmlFor="phone">{T.phone[locale]} *</label>
          <input id="phone" name="phone" required type="tel" className="field" placeholder="+7 (777) 000-00-00" />
          {state.errors?.phone ? <p className="field-error">{state.errors.phone}</p> : null}
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="email">{T.email[locale]}</label>
        <input id="email" name="email" type="email" className="field" placeholder="sad12@mail.kz" />
        {state.errors?.email ? <p className="field-error">{state.errors.email}</p> : null}
      </div>

      <div>
        <label className="field-label" htmlFor="comment">{T.comment[locale]}</label>
        <textarea id="comment" name="comment" rows={4} className="field" placeholder={T.commentExample[locale]} />
      </div>

      <p className="text-sm text-muted">
        {T.consent[locale]}
      </p>

      <SubmitButton pendingLabel={T.sending[locale]}>{T.submit[locale]}</SubmitButton>
    </form>
  );
}
