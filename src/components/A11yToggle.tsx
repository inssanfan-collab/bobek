'use client';

import { useEffect, useState } from 'react';
import { UiIcon } from '@/components/site/UiIcon';
import { A11Y_COOKIE } from '@/lib/a11y';
import type { Locale } from '@/lib/i18n';

const KEY = 'edusad:a11y';

const T = {
  title: { kk: 'Нашар көретіндерге арналған нұсқа', ru: 'Версия для слабовидящих' },
  on: { kk: 'Нашар көретіндерге', ru: 'Для слабовидящих' },
  off: { kk: 'Кәдімгі нұсқа', ru: 'Обычная версия' },
} as const;

function readCookie(): boolean {
  return document.cookie.split('; ').some((part) => part === `${A11Y_COOKIE}=1`);
}

function writeCookie(on: boolean) {
  // Год, весь сайт сада. Lax — обычные переходы по ссылкам режим сохраняют.
  document.cookie = `${A11Y_COOKIE}=${on ? '1' : '0'}; path=/; max-age=31536000; samesite=lax`;
}

/**
 * У сайта индивидуальная тема? Её разметку рисует сервер, поэтому смена
 * режима требует перезагрузки: в версии для слабовидящих сервер отдаёт
 * стандартную вёрстку вместо темы (см. activeTheme). Без темы режим — только
 * CSS, и страницу перезагружать незачем.
 */
function themed(): boolean {
  const root = document.documentElement;
  return Boolean(root.dataset.theme || root.dataset.themeOwn);
}

/**
 * Версия для слабовидящих. Режим хранится в cookie сайта сада — у каждого
 * сада свой домен, значит и своя настройка. Сервер знает о нём заранее.
 */
export function A11yToggle({ locale }: { locale: Locale }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const cookie = readCookie();
    let stored = cookie;
    try {
      // Прежде режим жил только в localStorage — переносим его в cookie один раз.
      if (!cookie && localStorage.getItem(KEY) === '1') stored = true;
    } catch {
      /* приватный режим браузера — просто работаем без сохранения */
    }
    setOn(stored);
    if (stored && !cookie) {
      writeCookie(true);
      if (themed()) {
        window.location.reload();
        return;
      }
    }
    document.documentElement.dataset.a11y = stored ? 'on' : 'off';
  }, []);

  function toggle() {
    const next = !on;
    writeCookie(next);
    try {
      localStorage.setItem(KEY, next ? '1' : '0');
    } catch {
      /* игнорируем */
    }
    if (themed()) {
      window.location.reload();
      return;
    }
    setOn(next);
    document.documentElement.dataset.a11y = next ? 'on' : 'off';
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
