'use client';

import { useActionState } from 'react';
import { submitFeedback, type FeedbackState } from '@/server/actions/feedback';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Alert } from '@/components/ui/Alert';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import type { Locale } from '@/lib/i18n';

const T = {
  intro: {
    kk: 'Сұрағыңызды жазыңыз — хабарлама тікелей меңгерушіге жетеді.',
    ru: 'Напишите ваш вопрос — обращение попадёт напрямую к заведующей.',
  },
  name: { kk: 'Атыңыз', ru: 'Ваше имя' },
  contact: { kk: 'Телефон немесе e-mail', ru: 'Телефон или e-mail' },
  message: { kk: 'Хабарлама', ru: 'Сообщение' },
  send: { kk: 'Жіберу', ru: 'Отправить' },
  sending: { kk: 'Жіберілуде…', ru: 'Отправляем…' },
  done: { kk: 'Хабарламаңыз жіберілді', ru: 'Обращение отправлено' },
  doneText: {
    kk: 'Жақын жұмыс күндері жауап береміз.',
    ru: 'Ответим в ближайшие рабочие дни.',
  },
  consent: {
    kk: 'Жіберу арқылы сіз көрсетілген байланыс деректерін өңдеуге келісім бересіз.',
    ru: 'Отправляя обращение, вы соглашаетесь на обработку указанных контактных данных.',
  },
} as const;

export function FeedbackForm({
  csrf,
  tenantId,
  locale,
}: {
  csrf: string;
  tenantId: string;
  locale: Locale;
}) {
  const [state, action] = useActionState<FeedbackState, FormData>(submitFeedback, { ok: false });

  if (state.ok) {
    return (
      <Alert tone="success" title={T.done[locale]}>
        {T.doneText[locale]}
      </Alert>
    );
  }

  return (
    <form action={action} className="card max-w-2xl space-y-4 p-6">
      <input type="hidden" name={CSRF_FIELD} value={csrf} />
      <input type="hidden" name="tenantId" value={tenantId} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <p className="text-muted">{T.intro[locale]}</p>

      {state.message ? <Alert tone="danger">{state.message}</Alert> : null}

      <div>
        <label className="field-label" htmlFor="fb-name">{T.name[locale]} *</label>
        <input id="fb-name" name="name" required className="field" />
      </div>

      <div>
        <label className="field-label" htmlFor="fb-contact">{T.contact[locale]} *</label>
        <input id="fb-contact" name="contact" required className="field" />
      </div>

      <div>
        <label className="field-label" htmlFor="fb-message">{T.message[locale]} *</label>
        <textarea id="fb-message" name="message" required rows={6} className="field" />
      </div>

      <p className="text-sm text-muted">{T.consent[locale]}</p>

      <SubmitButton pendingLabel={T.sending[locale]}>{T.send[locale]}</SubmitButton>
    </form>
  );
}
