'use client';

import { useFormStatus } from 'react-dom';
import type { ReactNode } from 'react';

/** Блокирует кнопку на время отправки: без этого сотрудники жмут «Сохранить» дважды. */
export function SubmitButton({
  children,
  className = 'btn-primary',
  pendingLabel = 'Сохраняем…',
}: {
  children: ReactNode;
  className?: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending} aria-busy={pending}>
      {pending ? pendingLabel : children}
    </button>
  );
}
