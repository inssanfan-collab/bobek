'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    /** Отметить шаг посещения: 'lead' — заявка отправлена (SalesApplyForm). */
    __edusadVisit?: (mark: string) => void;
  }
}

function randomId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, (c) => (c === '+' ? '-' : c === '/' ? '_' : ''));
}

function stored(storage: Storage | undefined, key: string): string {
  try {
    const existing = storage?.getItem(key);
    if (existing) return existing;
    const id = randomId();
    storage?.setItem(key, id);
    return id;
  } catch {
    return randomId();
  }
}

const SECTIONS = ['vid', 'adminka', 'tarify', 'voprosy', 'zayavka'];

/**
 * Шаги посещения продающих страниц — для сводки владельцу в Telegram
 * (src/server/visits.ts). Метка посетителя — в localStorage (повторные
 * заходы), посещения — в sessionStorage (одна вкладка — одно посещение).
 * Ничего, кроме адресов страниц, разделов и источника, не отправляет.
 */
export function VisitTracker() {
  useEffect(() => {
    const vid = stored(typeof localStorage === 'undefined' ? undefined : localStorage, 'edusad_vid');
    const sid = stored(typeof sessionStorage === 'undefined' ? undefined : sessionStorage, 'edusad_sid');
    const lang = new URLSearchParams(location.search).get('lang') === 'kk' ? 'kk' : 'ru';
    const send = (body: Record<string, unknown>) => {
      const payload = JSON.stringify({ sid, vid, lang, ...body });
      if (!navigator.sendBeacon?.('/api/visit', payload)) {
        fetch('/api/visit', { method: 'POST', body: payload, keepalive: true }).catch(() => undefined);
      }
    };
    const marked = new Set<string>();
    const mark = (name: string) => {
      if (marked.has(name)) return;
      marked.add(name);
      send({ type: 'mark', mark: name });
    };
    window.__edusadVisit = mark;

    // Откуда пришёл — только у первой страницы посещения.
    let landing: string | undefined;
    let referrer: string | undefined;
    try {
      if (!sessionStorage.getItem('edusad_landing')) {
        sessionStorage.setItem('edusad_landing', '1');
        landing = location.pathname + location.search;
        referrer = document.referrer;
      }
    } catch {
      /* без sessionStorage — каждая страница как новое посещение */
    }
    send({ type: 'page', path: location.pathname + location.search, title: document.title, landing, referrer });

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) mark(entry.target.id);
    }, { threshold: 0.25 });
    for (const id of SECTIONS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    const onFocus = (event: FocusEvent) => {
      if ((event.target as HTMLElement | null)?.closest?.('#zayavka form, form#apply')) mark('form');
    };
    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement | null)?.closest?.('a');
      if (!link) return;
      if (link.href.startsWith('tel:')) mark('phone');
      if (/demo\./.test(link.href)) mark('live');
    };
    document.addEventListener('focusin', onFocus);
    document.addEventListener('click', onClick);

    const ping = setInterval(() => {
      if (document.visibilityState === 'visible') send({ type: 'ping' });
    }, 15_000);

    return () => {
      observer.disconnect();
      document.removeEventListener('focusin', onFocus);
      document.removeEventListener('click', onClick);
      clearInterval(ping);
      delete window.__edusadVisit;
    };
  }, []);

  return null;
}
