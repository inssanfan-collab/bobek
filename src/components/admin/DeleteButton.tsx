'use client';

import { useFormStatus } from 'react-dom';
import type { ReactNode } from 'react';

/**
 * Кнопка «Удалить»: заблокирована, пока удаление идёт. Без неё двойное
 * нажатие отправляло второй запрос на уже удалённую запись (11.10.2026 —
 * у Юбилейного так пришли четыре «ошибки на сервере»). Подпись не меняется:
 * по этим экранам сняты ролики инструкции.
 */
export function DeleteButton({ children, className, title }: { children: ReactNode; className: string; title?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`${className} disabled:opacity-50`} title={title} disabled={pending} aria-busy={pending}>
      {children}
    </button>
  );
}
