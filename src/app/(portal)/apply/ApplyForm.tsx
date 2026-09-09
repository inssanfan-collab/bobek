'use client';

import { useActionState } from 'react';
import { submitLead, type LeadState } from './actions';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Alert } from '@/components/ui/Alert';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n';
import { CSRF_FIELD } from '@/server/auth/csrf.client';

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
  sending: { kk: 'Жіберілуде…', ru: 'Отправляем…' },
  submit: { kk: 'Өтінім жіберу', ru: 'Отправить заявку' },
} as const;

export function ApplyForm({ csrf, locale = DEFAULT_LOCALE }: { csrf: string; locale?: Locale }) {
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
