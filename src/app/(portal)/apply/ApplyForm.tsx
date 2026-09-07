'use client';

import { useActionState } from 'react';
import { submitLead, type LeadState } from './actions';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Alert } from '@/components/ui/Alert';
import { CSRF_FIELD } from '@/server/auth/csrf.client';

const initial: LeadState = { ok: false };

export function ApplyForm({ csrf }: { csrf: string }) {
  const [state, action] = useActionState(submitLead, initial);

  if (state.ok) {
    return (
      <Alert tone="success" title="Заявка отправлена">
        Мы свяжемся с вами в течение рабочего дня и подготовим сайт с доступами.
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
        <label className="field-label" htmlFor="gardenName">Название детского сада *</label>
        <input id="gardenName" name="gardenName" required className="field" placeholder="Ясли-сад №12 «Балдырған»" />
        {state.errors?.gardenName ? <p className="field-error">{state.errors.gardenName}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="personName">Ваше имя *</label>
          <input id="personName" name="personName" required className="field" placeholder="Айгүл Сериковна" />
          {state.errors?.personName ? <p className="field-error">{state.errors.personName}</p> : null}
        </div>
        <div>
          <label className="field-label" htmlFor="phone">Телефон *</label>
          <input id="phone" name="phone" required type="tel" className="field" placeholder="+7 (777) 000-00-00" />
          {state.errors?.phone ? <p className="field-error">{state.errors.phone}</p> : null}
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="email">Электронная почта</label>
        <input id="email" name="email" type="email" className="field" placeholder="sad12@mail.kz" />
        {state.errors?.email ? <p className="field-error">{state.errors.email}</p> : null}
      </div>

      <div>
        <label className="field-label" htmlFor="comment">Комментарий</label>
        <textarea id="comment" name="comment" rows={4} className="field" placeholder="Удобное время для звонка, пожелания к сайту" />
      </div>

      <p className="text-sm text-muted">
        Нажимая кнопку, вы соглашаетесь на обработку указанных контактных данных для связи по заявке.
      </p>

      <SubmitButton pendingLabel="Отправляем…">Отправить заявку</SubmitButton>
    </form>
  );
}
