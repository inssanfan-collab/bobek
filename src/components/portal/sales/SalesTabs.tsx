'use client';

import { useEffect } from 'react';

/**
 * Вкладки главной (темы сайта и дела в админке) и кнопки «Выбрать тариф».
 * Разметку отдаёт сервер — первая вкладка видна и без сценария, — а здесь
 * только переключение: клик, стрелки, как у обычного tablist.
 */
export function SalesTabs() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.sales');
    if (!root) return;
    const abort = new AbortController();
    const { signal } = abort;

    for (const list of root.querySelectorAll<HTMLElement>('[role="tablist"]')) {
      const tabs = [...list.querySelectorAll<HTMLElement>('[role="tab"]')];
      const select = (tab: HTMLElement) => {
        for (const t of tabs) {
          const on = t === tab;
          t.setAttribute('aria-selected', String(on));
          t.tabIndex = on ? 0 : -1;
          const panel = document.getElementById(t.getAttribute('aria-controls') ?? '');
          if (panel) panel.hidden = !on;
        }
      };
      list.addEventListener('click', (e) => {
        const tab = (e.target as HTMLElement).closest<HTMLElement>('[role="tab"]');
        if (tab) select(tab);
      }, { signal });
      list.addEventListener('keydown', (e) => {
        const step = ({ ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 } as Record<string, number>)[e.key];
        const i = tabs.indexOf(document.activeElement as HTMLElement);
        if (!step || i < 0) return;
        e.preventDefault();
        const next = tabs[(i + step + tabs.length) % tabs.length];
        next.focus();
        select(next);
      }, { signal });
    }

    // «Выбрать тариф» заранее отмечает его в форме заявки.
    for (const link of root.querySelectorAll<HTMLElement>('[data-plan]')) {
      link.addEventListener('click', () => {
        const input = root.querySelector<HTMLInputElement>(`#apply input[name=plan][value="${link.dataset.plan}"]`);
        if (input) input.checked = true;
      }, { signal });
    }

    return () => abort.abort();
  }, []);

  return null;
}
