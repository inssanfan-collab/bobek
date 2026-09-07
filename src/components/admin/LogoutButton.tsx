'use client';

import { useActionState, useEffect } from 'react';
import { logout } from '@/server/actions/logout';
import { EMPTY_ACTION_STATE, type ActionState } from '@/lib/action-state';

export function LogoutButton({ label = 'Выйти' }: { label?: string }) {
  const [state, action] = useActionState<ActionState, FormData>(
    () => logout(),
    EMPTY_ACTION_STATE,
  );

  useEffect(() => {
    if (state.redirectTo) window.location.assign(state.redirectTo);
  }, [state.redirectTo]);

  return (
    <form action={action}>
      <button type="submit" className="btn-secondary text-sm">{label}</button>
    </form>
  );
}
