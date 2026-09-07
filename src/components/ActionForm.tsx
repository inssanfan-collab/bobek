'use client';

import { useActionState, useEffect, type ReactNode } from 'react';
import { EMPTY_ACTION_STATE, type ActionState } from '@/lib/action-state';
import { Alert } from '@/components/ui/Alert';

export type StatefulAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

/**
 * Форма админки, которая умеет уводить на другую страницу после успеха.
 *
 * Переход делается через window.location, а не через redirect() на сервере:
 * серверный редирект внутри server action не проходит через middleware,
 * поэтому адрес сада разрешается в маршруты портала и выдаёт 404.
 */
export function ActionForm({
  action,
  children,
  className,
  errorClassName,
}: {
  action: StatefulAction;
  children: ReactNode;
  className?: string;
  errorClassName?: string;
}) {
  const [state, formAction] = useActionState(action, EMPTY_ACTION_STATE);

  useEffect(() => {
    if (state.redirectTo) window.location.assign(state.redirectTo);
  }, [state.redirectTo]);

  return (
    <form action={formAction} className={className}>
      {state.error ? (
        <div className={errorClassName ?? 'mb-4'}>
          <Alert tone="danger">{state.error}</Alert>
        </div>
      ) : null}
      {children}
    </form>
  );
}
