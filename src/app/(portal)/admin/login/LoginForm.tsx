'use client';

import { useActionState, useEffect } from 'react';
import { login, type LoginState } from './actions';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Alert } from '@/components/ui/Alert';
import { CSRF_FIELD } from '@/server/auth/csrf.client';

export function LoginForm({ csrf, next }: { csrf: string; next?: string }) {
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
        <label className="field-label" htmlFor="login">Логин</label>
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
        <label className="field-label" htmlFor="password">Пароль</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="field" />
      </div>

      <SubmitButton className="btn-primary w-full" pendingLabel="Входим…">Войти</SubmitButton>
    </form>
  );
}
