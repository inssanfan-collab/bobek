'use client';

import { useActionState, useEffect } from 'react';
import { login, loginCode, type LoginState } from './actions';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Alert } from '@/components/ui/Alert';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

const T = {
  login: { kk: 'Логин', ru: 'Логин' },
  password: { kk: 'Құпия сөз', ru: 'Пароль' },
  entering: { kk: 'Кіріп жатырмыз…', ru: 'Входим…' },
  submit: { kk: 'Кіру', ru: 'Войти' },
  code: { kk: 'Telegram-дағы код', ru: 'Код из Telegram' },
  codeHint: {
    kk: 'Бот Telegram-ға 6 цифр жіберді. Код 5 минут жарамды.',
    ru: 'Бот прислал в Telegram 6 цифр. Код действует 5 минут.',
  },
  checking: { kk: 'Тексеріп жатырмыз…', ru: 'Проверяем…' },
  confirm: { kk: 'Растау', ru: 'Подтвердить' },
  restart: { kk: 'Қайта кіру', ru: 'Войти заново' },
} as const;

export function LoginForm({
  csrf,
  next,
  locale = DEFAULT_LOCALE,
}: {
  csrf: string;
  next?: string;
  /** До входа язык пользователя ещё неизвестен, поэтому приходит из адреса. */
  locale?: Locale;
}) {
  const [state, action] = useActionState<LoginState, FormData>(login, {});
  const [codeState, codeAction] = useActionState<LoginState, FormData>(loginCode, {});
  // Второй шаг — пока токен из формы пароля не сгорел (время, попытки).
  // Сгорел — снова форма пароля; новый вход даст новый токен.
  const burned = codeState.expired && codeState.challenge === state.challenge;
  const challenge = !codeState.redirectTo && !burned ? state.challenge : undefined;
  const redirectTo = state.redirectTo ?? codeState.redirectTo;

  // Настоящий переход браузера: только он проходит через middleware,
  // которое и определяет, чей это домен — портала или конкретного сада.
  useEffect(() => {
    if (redirectTo) window.location.assign(redirectTo);
  }, [redirectTo]);

  if (challenge) {
    return (
      <form action={codeAction} className="space-y-4">
        <input type="hidden" name={CSRF_FIELD} value={csrf} />
        <input type="hidden" name="challenge" value={challenge} />
        {codeState.error && codeState.challenge === challenge ? <Alert tone="danger">{codeState.error}</Alert> : null}
        <div>
          <label className="field-label" htmlFor="code">{T.code[locale]}</label>
          <input
            id="code"
            name="code"
            required
            autoFocus
            inputMode="numeric"
            autoComplete="one-time-code"
            autoCapitalize="none"
            spellCheck={false}
            className="field text-center font-mono text-xl tracking-[0.3em]"
          />
          <p className="mt-1 text-xs text-muted">{T.codeHint[locale]}</p>
        </div>
        <SubmitButton className="btn-primary w-full" pendingLabel={T.checking[locale]}>{T.confirm[locale]}</SubmitButton>
        <button type="button" className="btn-ghost w-full text-sm" onClick={() => window.location.reload()}>{T.restart[locale]}</button>
      </form>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name={CSRF_FIELD} value={csrf} />
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {state.error ? <Alert tone="danger">{state.error}</Alert> : burned ? <Alert tone="danger">{codeState.error}</Alert> : null}

      <div>
        <label className="field-label" htmlFor="login">{T.login[locale]}</label>
        <input
          id="login"
          name="login"
          required
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          className="field"
        />
      </div>

      <div>
        <label className="field-label" htmlFor="password">{T.password[locale]}</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="field" />
      </div>

      <SubmitButton className="btn-primary w-full" pendingLabel={T.entering[locale]}>{T.submit[locale]}</SubmitButton>
    </form>
  );
}
