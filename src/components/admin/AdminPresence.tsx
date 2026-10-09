'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Как часто вкладка отмечается. В фоне браузер всё равно реже — раз в минуту. */
const PING_MS = 30_000;

/**
 * Отметка «я здесь» для раздела «Онлайн» админки портала (см. /api/presence):
 * какой раздел открыт и сколько секунд человек ничего не делал. Ничего
 * не рисует. Сбой отметки админке не мешает — просто не будет видно в «Онлайн».
 */
export function AdminPresence() {
  const pathname = usePathname();

  useEffect(() => {
    let lastInput = Date.now();
    const touch = () => {
      lastInput = Date.now();
    };
    const send = (payload: object) =>
      fetch('/api/presence', { method: 'POST', body: JSON.stringify(payload), keepalive: true }).catch(() => undefined);
    const ping = () =>
      send({ path: window.location.pathname + window.location.search, idle: Math.round((Date.now() - lastInput) / 1000) });
    const leave = () => navigator.sendBeacon?.('/api/presence', JSON.stringify({ leave: true }));

    ping();
    const timer = window.setInterval(ping, PING_MS);
    const events = ['pointerdown', 'keydown', 'input', 'scroll'] as const;
    for (const name of events) window.addEventListener(name, touch, { passive: true });
    window.addEventListener('pagehide', leave);
    return () => {
      window.clearInterval(timer);
      for (const name of events) window.removeEventListener(name, touch);
      window.removeEventListener('pagehide', leave);
    };
    // pathname — чтобы переход в другой раздел отмечался сразу, а не через 30 секунд.
  }, [pathname]);

  return null;
}
