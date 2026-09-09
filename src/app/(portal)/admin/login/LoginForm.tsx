'use client';

import { useActionState, useEffect } from 'react';
import { login, type LoginState } from './actions';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Alert } from '@/components/ui/Alert';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

const T = {
  login: { kk: 'Логин', ru: 'Логин' },
  password: { kk: 'Құпия сөз', ru: 'Пароль' },
  entering: { kk: 'Кіріп жатырмыз…', ru: 'Входим…' },
  submit: { kk: 'Кіру', ru: 'Войти' },
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

  // Настоящий переход браузера: только он проходит через middleware,
  // которое и определяет, чей это домен — портала или конкретного сада.
  useEffect(() => {
    if (state.redirectTo) window.location.assign(state.redirectTo);
  }, [state.redirectTo]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name={CSRF_FIELD} value={csrf} />
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}

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
