'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { submitLead, type LeadState } from '@/app/(portal)/apply/actions';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { PLAN_CODES, PLAN_INFO } from '@/lib/plans';
import type { Locale } from '@/lib/i18n';

const T = {
  gardenName: { kk: 'Балабақшаның атауы', ru: 'Название детского сада' },
  personName: { kk: 'Сіздің атыңыз', ru: 'Ваше имя' },
  personExample: { kk: 'Аты-жөні', ru: 'Имя Фамилия' },
  phone: { kk: 'Телефон', ru: 'Телефон' },
  plan: { kk: 'Тариф', ru: 'Тариф' },
  undecided: { kk: 'Әлі шешпедік', ru: 'Ещё не решили' },
  submit: { kk: 'Өтінім жіберу', ru: 'Отправить заявку' },
  sending: { kk: 'Жіберілуде…', ru: 'Отправляем…' },
  consent: {
    kk: 'Түймені басу арқылы сіз өтінім бойынша байланысу үшін көрсетілген байланыс деректерін өңдеуге келісім бересіз.',
    ru: 'Нажимая кнопку, вы соглашаетесь на обработку указанных контактных данных для связи по заявке.',
  },
  sent: { kk: 'Өтінім жіберілді', ru: 'Заявка отправлена' },
  sentText: {
    kk: 'Бүгін жұмыс уақытында қайта қоңырау шалып, барлық сұраққа жауап береміз.',
    ru: 'Перезвоним сегодня в рабочее время и ответим на все вопросы.',
  },
} as const;

const initial: LeadState = { ok: false };

function Submit({ locale }: { locale: Locale }) {
  const { pending } = useFormStatus();
  return (
    <button className="sbtn sbtn-primary" type="submit" disabled={pending}>
      {pending ? T.sending[locale] : T.submit[locale]}
    </button>
  );
}

/**
 * Заявка с главной. Тот же обработчик, что у страницы /apply (submitLead):
 * CSRF, ограничение частоты, ловушка для ботов и письмо владельцу.
 */
export function SalesApplyForm({ csrf, locale }: { csrf: string; locale: Locale }) {
  const [state, action] = useActionState(submitLead, initial);

  // Конфетти после отправки — тем же цветом, что шарики первого экрана.
  useEffect(() => {
    if (!state.ok || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    import('canvas-confetti').then(({ default: confetti }) => {
      const r = document.getElementById('apply')?.getBoundingClientRect();
      if (!r) return;
      const origin = { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height * 0.6) / innerHeight };
      const colors = ['#FFC53D', '#FF8F7E', '#7FDAB6', '#B8B3FF', '#9AD2F6', '#ffffff'];
      confetti({ particleCount: 120, spread: 75, startVelocity: 42, origin, colors, shapes: ['circle'], scalar: 1.3 });
      setTimeout(() => confetti({ particleCount: 80, spread: 110, startVelocity: 30, origin, colors, shapes: ['circle'], scalar: 0.9 }), 250);
    }).catch(() => {});
  }, [state.ok]);

  if (state.ok) {
    return (
      <div id="apply" className="form sent" role="status">
        <div className="sent-msg">
          <b>{T.sent[locale]}</b>
          <p>{T.sentText[locale]}</p>
        </div>
      </div>
    );
  }

  const error = (name: string) => (state.errors?.[name] ? <span className="err">{state.errors[name]}</span> : null);

  return (
    <form className="form" id="apply" action={action}>
      <input type="hidden" name={CSRF_FIELD} value={csrf} />
      {/* Ловушка для ботов: человек это поле не видит и не заполняет. */}
      <label className="trap" aria-hidden="true">
        Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
      {state.message && !state.ok ? <p className="form-msg" role="alert">{state.message}</p> : null}
      <div className="full">
        <label htmlFor="f-garden">{T.gardenName[locale]}</label>
        <input type="text" id="f-garden" name="gardenName" required maxLength={200} />
        {error('gardenName')}
      </div>
      <div>
        <label htmlFor="f-name">{T.personName[locale]}</label>
        <input type="text" id="f-name" name="personName" required maxLength={120} placeholder={T.personExample[locale]} autoComplete="name" />
        {error('personName')}
      </div>
      <div>
        <label htmlFor="f-phone">{T.phone[locale]}</label>
        <input type="tel" id="f-phone" name="phone" required maxLength={40} placeholder="+7 (777) 000-00-00" autoComplete="tel" />
        {error('phone')}
      </div>
      <fieldset className="full">
        <legend>{T.plan[locale]}</legend>
        {PLAN_CODES.map((code) => (
          <label key={code} className="opt">
            <input type="radio" name="plan" value={code} />
            <span>{PLAN_INFO[code].name[locale]}</span>
          </label>
        ))}
        <label className="opt">
          <input type="radio" name="plan" value="" defaultChecked />
          <span>{T.undecided[locale]}</span>
        </label>
      </fieldset>
      <div className="full"><Submit locale={locale} /></div>
      <p className="consent full">{T.consent[locale]}</p>
    </form>
  );
}
