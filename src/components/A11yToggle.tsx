'use client';

import { useEffect, useState } from 'react';

const KEY = 'bobegim:a11y';

/**
 * Версия для слабовидящих. Состояние держим в localStorage самого сайта сада —
 * у каждого сада свой домен, значит и своя настройка, что как раз правильно.
 */
export function A11yToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY) === '1';
      setOn(stored);
      document.documentElement.dataset.a11y = stored ? 'on' : 'off';
    } catch {
      /* приватный режим браузера — просто работаем без сохранения */
    }
  }, []);

  function toggle() {
    const next = !on;
    setOn(next);
    document.documentElement.dataset.a11y = next ? 'on' : 'off';
    try {
      localStorage.setItem(KEY, next ? '1' : '0');
    } catch {
      /* игнорируем */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm font-semibold hover:bg-brand-soft"
      aria-pressed={on}
      title="Версия для слабовидящих"
    >
      <span aria-hidden>👁</span>
      <span className="hidden sm:inline">{on ? 'Обычная версия' : 'Для слабовидящих'}</span>
    </button>
  );
}
