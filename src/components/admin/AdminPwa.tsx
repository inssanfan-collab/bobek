'use client';

import { useEffect } from 'react';

/**
 * Регистрирует фоновый скрипт админки (public/admin-sw.js): без него
 * не придут push-уведомления. Ничего не рисует. Ошибка регистрации
 * админке не мешает — просто не будет уведомлений.
 */
export function AdminPwa() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/admin-sw.js', { scope: '/admin' }).catch(() => undefined);
    }
  }, []);
  return null;
}
