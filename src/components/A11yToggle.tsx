'use client';

import { useEffect, useState } from 'react';
import { UiIcon } from '@/components/site/UiIcon';
import type { Locale } from '@/lib/i18n';

const KEY = 'edusad:a11y';

const T = {
  title: { kk: 'Нашар көретіндерге арналған нұсқа', ru: 'Версия для слабовидящих' },
  on: { kk: 'Нашар көретіндерге', ru: 'Для слабовидящих' },
  off: { kk: 'Кәдімгі нұсқа', ru: 'Обычная версия' },
} as const;

/**
 * Включить или выключить режим. Индивидуальная тема на время режима
 * снимается: её CSS действует только при data-theme, и контрастная версия
 * не должна зависеть от того, как тема раскрасила сайт.
 */
function apply(on: boolean) {
  const root = document.documentElement;
  root.dataset.a11y = on ? 'on' : 'off';
  if (on && root.dataset.theme) {
    root.dataset.themeOff = root.dataset.theme;
    delete root.dataset.theme;
  } else if (!on && root.dataset.themeOff) {
    root.dataset.theme = root.dataset.themeOff;
    delete root.dataset.themeOff;
  }
}

/**
 * Версия для слабовидящих. Состояние держим в localStorage самого сайта сада —
 * у каждого сада свой домен, значит и своя настройка, что как раз правильно.
 */
export function A11yToggle({ locale }: { locale: Locale }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY) === '1';
      setOn(stored);
      apply(stored);
    } catch {
      /* приватный режим браузера — просто работаем без сохранения */
    }
  }, []);

  function toggle() {
    const next = !on;
    setOn(next);
    apply(next);
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
      title={T.title[locale]}
    >
      <UiIcon name="eye" className="h-4 w-4" />
      <span className="hidden sm:inline">{on ? T.off[locale] : T.on[locale]}</span>
    </button>
  );
}
