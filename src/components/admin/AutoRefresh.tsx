'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Перерисовывает страницу с сервера раз в `seconds` секунд, пока вкладка видна. */
export function AutoRefresh({ seconds }: { seconds: number }) {
  const router = useRouter();
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') router.refresh();
    }, seconds * 1000);
    return () => window.clearInterval(timer);
  }, [router, seconds]);
  return null;
}
